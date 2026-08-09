import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/products', ProductController.listPublic);
router.get('/products/:id', ProductController.getPublic);

// Admin routes
router.get('/admin/products', authenticateAdmin, ProductController.listAdmin);
router.get('/admin/products/:id', authenticateAdmin, ProductController.getAdmin);
router.post('/admin/products', authenticateAdmin, ProductController.create);
router.put('/admin/products/:id', authenticateAdmin, ProductController.update);
router.delete('/admin/products/:id', authenticateAdmin, ProductController.delete);

export default router;
