import { db } from '../config/firebase.js';
import { validateCollectionPayload, validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('drivers');

export const DriverModel = {
  async findAvailableByVehicle(vehicleType) {
    const snapshot = await collection
      .where('status', '==', 'approved')
      .where('availability', '==', 'available')
      .where('vehicleType', '==', vehicleType)
      .get();

    return snapshot.docs;
  },

  async update(driverId, payload) {
    const existing = await collection.doc(driverId).get();
    const merged = { ...(existing.exists ? existing.data() : {}), ...payload };

    const validation = validateCollectionPayload('drivers', merged);
    if (!validation.isValid && existing.exists) {
      throw new Error(`drivers validation failed: ${validation.errors.join('; ')}`);
    }

    if (!existing.exists) {
      validateAndThrow('drivers', merged);
    }

    await collection.doc(driverId).set(payload, { merge: true });
  }
};
