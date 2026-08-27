import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Allowed image MIME types — explicitly listed to prevent spoofing
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
]);

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB limit (sharp compresses before upload)
        files: 1,                   // only 1 file per request
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF, SVG, AVIF`));
        }
    },
});

router.post(
    '/admin/uploads/image',
    authenticateAdmin,
    upload.single('file'),
    UploadController.uploadImage
);

export default router;
