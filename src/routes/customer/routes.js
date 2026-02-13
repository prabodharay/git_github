import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import bookingRoutes from '../booking.routes.js';

const router = Router();

router.use(authenticate, authorizeRoles('customer'));
router.use('/bookings', bookingRoutes);

export default router;
