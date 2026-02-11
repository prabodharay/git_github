import { db } from '../config/firebase.js';

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
    await collection.doc(driverId).set(payload, { merge: true });
  }
};
