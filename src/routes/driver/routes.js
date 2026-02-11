import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { sendError, sendSuccess } from '../../utils/http.js';
import { BookingModel } from '../../models/booking.model.js';

const router = Router();

router.use(authenticate, authorizeRoles('driver'));

router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['accepted', 'arrived', 'started', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return sendError(res, 'Invalid booking status', 400, { allowed });
    }

    const bookingSnapshot = await BookingModel.findById(req.params.bookingId);
    if (!bookingSnapshot.exists) {
      return sendError(res, 'Booking not found', 404);
    }

    if (bookingSnapshot.data().driverId !== req.auth.uid) {
      return sendError(res, 'This booking is not assigned to you', 403);
    }

    const updated = await BookingModel.update(req.params.bookingId, {
      status,
      updatedAt: new Date().toISOString()
    });

    return sendSuccess(res, { id: updated.id, ...updated.data() });
  } catch (error) {
    return sendError(res, 'Unable to update booking status', 400, error.message);
  }
});

export default router;
