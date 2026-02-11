import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { BookingService } from '../services/booking.service.js';
import { BookingModel } from '../models/booking.model.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('customer'), async (req, res) => {
  try {
    const booking = await BookingService.createBooking({
      customerId: req.auth.uid,
      payload: req.body
    });

    return sendSuccess(res, booking, 201);
  } catch (error) {
    return sendError(res, 'Booking creation failed', 400, error.message);
  }
});

router.post(
  '/:bookingId/assign-driver',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const result = await BookingService.assignDriver(req.params.bookingId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, 'Driver assignment failed', 400, error.message);
    }
  }
);

router.patch('/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    const result = await BookingService.updateBookingStatus({
      bookingId: req.params.bookingId,
      status,
      actorRole: req.auth.role,
      actorId: req.auth.uid
    });

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'Booking status update failed', 400, error.message);
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 25);
    const bookings = await BookingService.listBookings({
      role: req.auth.role,
      uid: req.auth.uid,
      limit
    });

    return sendSuccess(res, {
      count: bookings.length,
      bookings
    });
  } catch (error) {
    return sendError(res, 'Failed to list bookings', 500, error.message);
  }
});

router.get('/:bookingId/status', authenticate, async (req, res) => {
  try {
    const status = await BookingService.getBookingStatus(req.params.bookingId);

    return sendSuccess(res, status);
  } catch (error) {
    return sendError(res, 'Failed to fetch booking status', 404, error.message);
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
