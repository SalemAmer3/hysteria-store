import { Router } from 'express';
import { ProductImageController } from './productImage.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/product-images', ProductImageController.listPublic);
router.get('/product-images/:id', ProductImageController.getPublic);

// Admin routes
router.get('/admin/product-images', authenticateAdmin, ProductImageController.listAdmin);
router.get('/admin/product-images/:id', authenticateAdmin, ProductImageController.getAdmin);
router.post('/admin/product-images', authenticateAdmin, ProductImageController.create);
router.put('/admin/product-images/:id', authenticateAdmin, ProductImageController.update);
router.delete('/admin/product-images/:id', authenticateAdmin, ProductImageController.delete);

export default router;
