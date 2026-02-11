import { env } from '../config/env.js';
import { PricingModel } from '../models/pricing.model.js';

export const FareService = {
  async calculateFare({ vehicleType, distanceKm }) {
    const pricingSnapshot = await PricingModel.findByVehicleType(vehicleType);

    if (!pricingSnapshot.exists) {
      throw new Error(`Pricing rule not found for vehicle type: ${vehicleType}`);
    }

    const pricing = pricingSnapshot.data();
    const baseFare = Number(pricing.baseFare || 0);
    const perKmRate = Number(pricing.perKmRate || 0);
    const surgeMultiplier = Number(
      pricing.surgeMultiplier || env.defaultSurgeMultiplier
    );

    const fareBeforeSurge = baseFare + Number(distanceKm) * perKmRate + env.platformFee;
    const finalFare = Number((fareBeforeSurge * surgeMultiplier).toFixed(2));

    return {
      vehicleType,
      distanceKm: Number(distanceKm),
      pricing: {
        baseFare,
        perKmRate,
        platformFee: env.platformFee,
        surgeMultiplier
      },
      fare: finalFare
    };
  }
};
