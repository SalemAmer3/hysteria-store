import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', CategoryController.listPublic);
router.get('/categories/:id', CategoryController.getPublic);

// Admin routes
router.get('/admin/categories', authenticateAdmin, CategoryController.listAdmin);
router.get('/admin/categories/:id', authenticateAdmin, CategoryController.getAdmin);
router.post('/admin/categories', authenticateAdmin, CategoryController.create);
router.put('/admin/categories/:id', authenticateAdmin, CategoryController.update);
router.delete('/admin/categories/:id', authenticateAdmin, CategoryController.delete);

export default router;
