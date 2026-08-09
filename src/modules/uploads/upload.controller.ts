import { Request, Response, NextFunction } from 'express';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';

export class UploadController {
    static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const file = req.file;

            if (!file) {
                throw new CustomError(400, 'No file uploaded under field "file"');
            }

            // Validate MIME type
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!allowedMimes.includes(file.mimetype)) {
                throw new CustomError(400, 'Invalid file type. Supported types: JPEG, PNG, WEBP');
            }

            // Double check file size (just to be safe, though multer limits it)
            const maxSize = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSize) {
                throw new CustomError(400, 'File size exceeds limit of 5 MB');
            }

            // Upload to Cloudflare R2
            // Using generic upload folder
            const imageUrl = await R2Service.uploadImage(file.buffer, file.mimetype, 'uploads');

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
