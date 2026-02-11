import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookingRoutes from './booking.routes.js';
import pricingRoutes from './pricing.routes.js';
import customerRoutes from './customer/routes.js';
import driverRoutes from './driver/routes.js';
import adminRoutes from './admin/routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'LoadEx backend is running' });
});

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/pricing', pricingRoutes);
router.use('/customer', customerRoutes);
router.use('/driver', driverRoutes);
router.use('/admin', adminRoutes);

export default router;
