import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
});

router.post(
    '/admin/uploads/image',
    authenticateAdmin,
    upload.single('file'),
    UploadController.uploadImage
);

export default router;
