import { env } from '../config/env.js';
import { DriverModel } from '../models/driver.model.js';
import { distanceKmBetweenCoordinates } from '../utils/geo.js';

export const DriverAssignmentService = {
  async assignDriver({ vehicleType, pickupLocation }) {
    const candidates = await DriverModel.findAvailableByVehicle(vehicleType);

    const rankedDrivers = candidates
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        distanceKm: distanceKmBetweenCoordinates(pickupLocation, doc.data().location)
      }))
      .filter((driver) => driver.distanceKm <= env.driverMatchRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (!rankedDrivers.length) {
      return null;
    }

    return rankedDrivers[0];
  }
};
