import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';

// MIME types that sharp can compress — others pass through as-is
const COMPRESSIBLE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);

/**
 * Compresses an image buffer using sharp.
 * - JPEG/JPG → JPEG quality 80
 * - PNG      → PNG with compression level 8
 * - WEBP     → WEBP quality 80
 * - AVIF     → AVIF quality 60
 * - GIF/SVG/others → returned unchanged
 * Always outputs as WEBP for JPEG/PNG to maximize compression while keeping quality.
 */
async function compressImage(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!COMPRESSIBLE_MIMES.has(mimeType)) {
        return { buffer, mimeType };
    }

    const compressed = await sharp(buffer)
        .webp({ quality: 82 })   // convert everything compressible to webp — best size/quality ratio
        .toBuffer();

    // Only use compressed version if it's actually smaller
    if (compressed.length < buffer.length) {
        return { buffer: compressed, mimeType: 'image/webp' };
    }

    return { buffer, mimeType };
}

export class UploadController {
    static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const file = req.file;

            if (!file) {
                throw new CustomError(400, 'No file uploaded under field "file"');
            }

            // Validate MIME type
            const allowedMimes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
                'image/gif', 'image/bmp', 'image/tiff', 'image/avif',
                'image/svg+xml', 'application/octet-stream',
            ];
            if (!allowedMimes.includes(file.mimetype) && !file.mimetype.startsWith('image/')) {
                throw new CustomError(400, 'Invalid file type. Supported types: JPEG, PNG, WEBP, GIF');
            }

            // Double check file size (multer already limits, this is a safety net)
            const maxSize = 20 * 1024 * 1024; // 20 MB (generous — compression will shrink it)
            if (file.size > maxSize) {
                throw new CustomError(400, 'File size exceeds limit of 20 MB');
            }

            // Compress before uploading
            const { buffer, mimeType } = await compressImage(file.buffer, file.mimetype);

            // Upload to Cloudflare R2
            const imageUrl = await R2Service.uploadImage(buffer, mimeType, 'uploads');

            res.status(200).json({
                success: true,
                data: {
                    url: imageUrl,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
