import { Router } from 'express';
import { SliderController } from './slider.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/sliders', SliderController.listPublic);
router.get('/sliders/:id', SliderController.getPublic);

// Admin routes
router.get('/admin/sliders', authenticateAdmin, SliderController.listAdmin);
router.get('/admin/sliders/:id', authenticateAdmin, SliderController.getAdmin);
router.post('/admin/sliders', authenticateAdmin, SliderController.create);
router.put('/admin/sliders/:id', authenticateAdmin, SliderController.update);
router.delete('/admin/sliders/:id', authenticateAdmin, SliderController.delete);

export default router;
