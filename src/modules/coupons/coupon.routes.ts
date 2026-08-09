import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/coupons/:code', CouponController.checkCoupon);

// Admin routes
router.get('/admin/coupons', authenticateAdmin, CouponController.listAdmin);
router.get('/admin/coupons/:id', authenticateAdmin, CouponController.getAdmin);
router.post('/admin/coupons', authenticateAdmin, CouponController.create);
router.put('/admin/coupons/:id', authenticateAdmin, CouponController.update);
router.delete('/admin/coupons/:id', authenticateAdmin, CouponController.delete);

export default router;
