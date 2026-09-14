import { Router } from 'express';
import { TranslateController } from './translate.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// POST /api/admin/translate — admin-only, proxies MyMemory
router.post('/admin/translate', authenticateAdmin, TranslateController.translate);

export default router;
