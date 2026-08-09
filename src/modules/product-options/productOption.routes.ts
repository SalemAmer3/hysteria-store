import { Router } from 'express';
import { ProductOptionController } from './productOption.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/product-options', ProductOptionController.listPublic);
router.get('/product-options/:id', ProductOptionController.getPublic);

// Admin routes
router.get('/admin/product-options', authenticateAdmin, ProductOptionController.listAdmin);
router.get('/admin/product-options/:id', authenticateAdmin, ProductOptionController.getAdmin);
router.post('/admin/product-options', authenticateAdmin, ProductOptionController.create);
router.put('/admin/product-options/:id', authenticateAdmin, ProductOptionController.update);
router.delete('/admin/product-options/:id', authenticateAdmin, ProductOptionController.delete);

export default router;
