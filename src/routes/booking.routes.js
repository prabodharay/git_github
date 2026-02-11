import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { BookingService } from '../services/booking.service.js';
import { BookingModel } from '../models/booking.model.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('customer'), async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.pickupLocation || !payload.dropLocation || !payload.vehicleType) {
      return sendError(
        res,
        'pickupLocation, dropLocation and vehicleType are required',
        400
      );
    }

    const booking = await BookingService.createBooking({
      customerId: req.auth.uid,
      payload
    });

    return sendSuccess(res, booking, 201);
  } catch (error) {
    return sendError(res, 'Booking creation failed', 400, error.message);
  }
});

router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const bookingSnapshot = await BookingModel.findById(req.params.bookingId);

    if (!bookingSnapshot.exists) {
      return sendError(res, 'Booking not found', 404);
    }

    const booking = { id: bookingSnapshot.id, ...bookingSnapshot.data() };

    const canAccess =
      req.auth.role === 'admin' ||
      booking.customerId === req.auth.uid ||
      booking.driverId === req.auth.uid;

    if (!canAccess) {
      return sendError(res, 'You do not have access to this booking', 403);
    }

    return sendSuccess(res, booking);
  } catch (error) {
    return sendError(res, 'Failed to fetch booking', 500, error.message);
  }
});

export default router;
