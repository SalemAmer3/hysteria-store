import { Router } from 'express';
import { BrandController } from './brand.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/brands', BrandController.listPublic);
router.get('/brands/:id', BrandController.getPublic);

// Admin routes
router.get('/admin/brands', authenticateAdmin, BrandController.listAdmin);
router.get('/admin/brands/:id', authenticateAdmin, BrandController.getAdmin);
router.post('/admin/brands', authenticateAdmin, BrandController.create);
router.put('/admin/brands/:id', authenticateAdmin, BrandController.update);
router.delete('/admin/brands/:id', authenticateAdmin, BrandController.delete);

export default router;
