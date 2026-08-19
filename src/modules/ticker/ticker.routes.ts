import { Router } from 'express';
import { TickerController } from './ticker.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public
router.get('/ticker', TickerController.listPublic);

// Admin
router.get('/admin/ticker', authenticateAdmin, TickerController.listAdmin);
router.post('/admin/ticker', authenticateAdmin, TickerController.create);
router.put('/admin/ticker/:id', authenticateAdmin, TickerController.update);
router.delete('/admin/ticker/:id', authenticateAdmin, TickerController.delete);

export default router;
