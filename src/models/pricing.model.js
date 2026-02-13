import { db } from '../config/firebase.js';
import { validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('pricing_rules');

export const PricingModel = {
  async findByVehicleType(vehicleType) {
    return collection.doc(vehicleType).get();
  },

  async upsert(vehicleType, payload) {
    validateAndThrow('pricing_rules', payload);
    await collection.doc(vehicleType).set(payload, { merge: true });
    return collection.doc(vehicleType).get();
  }
};
