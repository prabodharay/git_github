import { db } from '../config/firebase.js';

const collection = db.collection('pricing_rules');

export const PricingModel = {
  async findByVehicleType(vehicleType) {
    return collection.doc(vehicleType).get();
  }
};
