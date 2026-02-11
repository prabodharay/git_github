import { db } from '../config/firebase.js';
import { validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('transactions');

export const TransactionModel = {
  async create(payload) {
    validateAndThrow('transactions', payload);
    const reference = collection.doc();
    await reference.set(payload);
    return reference.get();
  },

  async listByDriver(driverId, limit = 20) {
    const snapshot = await collection
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
};
