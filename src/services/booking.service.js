import { BookingModel } from '../models/booking.model.js';
import { DriverModel } from '../models/driver.model.js';
import { FareService } from './fare.service.js';
import { DriverAssignmentService } from './driver-assignment.service.js';
import { distanceKmBetweenCoordinates } from '../utils/geo.js';

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const validStatus = Object.values(BOOKING_STATUS);

const ensureLocation = (name, location) => {
  if (!location || typeof location !== 'object') {
    throw new Error(`${name} is required`);
  }

  const { lat, lng } = location;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error(`${name}.lat and ${name}.lng must be numbers`);
  }
};

const resolveDistance = (pickupLocation, dropLocation, distanceKm) => {
  if (Number(distanceKm) > 0) {
    return Number(distanceKm);
  }

  return distanceKmBetweenCoordinates(pickupLocation, dropLocation);
};

const normalizeBookingResponse = (booking, fareBreakdown = null, assignedDriver = null) => ({
  id: booking.id,
  ...booking.data(),
  fareBreakdown,
  assignedDriver: assignedDriver
    ? {
        id: assignedDriver.id,
        name: assignedDriver.name || null,
        vehicleType: assignedDriver.vehicleType,
        distanceKm: assignedDriver.distanceKm
      }
    : null
});

export const BookingService = {
  async createBooking({ customerId, payload }) {
    ensureLocation('pickupLocation', payload.pickupLocation);
    ensureLocation('dropLocation', payload.dropLocation);

    if (!payload.vehicleType) {
      throw new Error('vehicleType is required');
    }

    const distanceKm = resolveDistance(
      payload.pickupLocation,
      payload.dropLocation,
      payload.distanceKm
    );

    if (!distanceKm || distanceKm <= 0) {
      throw new Error('distanceKm must be greater than 0');
    }

    const fareResult = await FareService.calculateFare({
      vehicleType: payload.vehicleType,
      distanceKm
    });

    const assignedDriver = await DriverAssignmentService.assignDriver({
      vehicleType: payload.vehicleType,
      pickupLocation: payload.pickupLocation
    });

    const bookingBody = {
      customerId,
      driverId: assignedDriver?.id || null,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      distanceKm,
      vehicleType: payload.vehicleType,
      loadDescription: payload.loadDescription || '',
      loadPhotos: payload.loadPhotos || [],
      fare: fareResult.fare,
      status: assignedDriver ? BOOKING_STATUS.ACCEPTED : BOOKING_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bookingSnapshot = await BookingModel.create(bookingBody);

    if (assignedDriver?.id) {
      await DriverModel.update(assignedDriver.id, {
        availability: 'busy',
        updatedAt: new Date().toISOString()
      });
    }

    return normalizeBookingResponse(bookingSnapshot, fareResult.pricing, assignedDriver);
  },

  async getBookingStatus(bookingId) {
    const snapshot = await BookingModel.findById(bookingId);

    if (!snapshot.exists) {
      throw new Error('Booking not found');
    }

    const booking = snapshot.data();
    return {
      bookingId: snapshot.id,
      status: booking.status,
      driverId: booking.driverId || null,
      fare: booking.fare,
      updatedAt: booking.updatedAt
    };
  },

  async assignDriver(bookingId) {
    const snapshot = await BookingModel.findById(bookingId);
    if (!snapshot.exists) {
      throw new Error('Booking not found');
    }

    const booking = snapshot.data();
    if (booking.driverId) {
      return { bookingId, driverId: booking.driverId, status: booking.status };
    }

    const assignedDriver = await DriverAssignmentService.assignDriver({
      vehicleType: booking.vehicleType,
      pickupLocation: booking.pickupLocation
    });

    if (!assignedDriver) {
      return { bookingId, driverId: null, status: BOOKING_STATUS.PENDING };
    }

    await BookingModel.update(bookingId, {
      driverId: assignedDriver.id,
      status: BOOKING_STATUS.ACCEPTED,
      updatedAt: new Date().toISOString()
    });

    await DriverModel.update(assignedDriver.id, {
      availability: 'busy',
      updatedAt: new Date().toISOString()
    });

    return {
      bookingId,
      driverId: assignedDriver.id,
      status: BOOKING_STATUS.ACCEPTED,
      assignedDriver: {
        id: assignedDriver.id,
        name: assignedDriver.name || null,
        distanceKm: assignedDriver.distanceKm
      }
    };
  },

  async updateBookingStatus({ bookingId, status, actorRole, actorId }) {
    if (!validStatus.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const snapshot = await BookingModel.findById(bookingId);
    if (!snapshot.exists) {
      throw new Error('Booking not found');
    }

    const booking = snapshot.data();

    if (actorRole === 'customer' && booking.customerId !== actorId) {
      throw new Error('Customer cannot update this booking');
    }

    if (actorRole === 'driver' && booking.driverId !== actorId) {
      throw new Error('Driver cannot update this booking');
    }

    if (actorRole === 'customer' && ![BOOKING_STATUS.CANCELLED].includes(status)) {
      throw new Error('Customer can only cancel booking');
    }

    const updated = await BookingModel.update(bookingId, {
      status,
      updatedAt: new Date().toISOString()
    });

    return {
      id: updated.id,
      ...updated.data()
    };
  },

  async listBookings({ role, uid, limit = 25 }) {
    if (role === 'admin') {
      return BookingModel.listAll(limit);
    }

    if (role === 'driver') {
      return BookingModel.listByDriver(uid, limit);
    }

    return BookingModel.listByCustomer(uid, limit);
  }
};
