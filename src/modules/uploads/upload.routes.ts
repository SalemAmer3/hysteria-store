import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024, // 8 MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Accept all image types
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(null, false);
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
