import admin from '../config/firebase.js';
import { BookingModel } from '../models/booking.model.js';
import { DriverModel } from '../models/driver.model.js';
import { FareService } from './fare.service.js';
import { DriverAssignmentService } from './driver-assignment.service.js';

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted'
};

export const BookingService = {
  async createBooking({ customerId, payload }) {
    const fareResult = await FareService.calculateFare({
      vehicleType: payload.vehicleType,
      distanceKm: payload.distanceKm
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
      distanceKm: Number(payload.distanceKm),
      vehicleType: payload.vehicleType,
      loadDescription: payload.loadDescription || '',
      loadPhotos: payload.loadPhotos || [],
      fare: fareResult.fare,
      status: assignedDriver ? BOOKING_STATUS.ACCEPTED : BOOKING_STATUS.PENDING,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const bookingSnapshot = await BookingModel.create(bookingBody);

    if (assignedDriver?.id) {
      await DriverModel.update(assignedDriver.id, {
        availability: 'busy',
        updatedAt: new Date().toISOString()
      });
    }

    return {
      id: bookingSnapshot.id,
      ...bookingSnapshot.data(),
      assignedDriver: assignedDriver
        ? {
            id: assignedDriver.id,
            distanceKm: assignedDriver.distanceKm,
            vehicleType: assignedDriver.vehicleType,
            name: assignedDriver.name || null
          }
        : null
    };
  }
};
