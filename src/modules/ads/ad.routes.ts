import { Router } from 'express';
import { AdController } from './ad.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/ads', AdController.listPublic);
router.get('/ads/:id', AdController.getPublic);

// Admin routes
router.get('/admin/ads', authenticateAdmin, AdController.listAdmin);
router.get('/admin/ads/:id', authenticateAdmin, AdController.getAdmin);
router.post('/admin/ads', authenticateAdmin, AdController.create);
router.put('/admin/ads/:id', authenticateAdmin, AdController.update);
router.delete('/admin/ads/:id', authenticateAdmin, AdController.delete);

export default router;
