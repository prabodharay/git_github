import { db } from '../config/firebase.js';
import { validateCollectionPayload, validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('bookings');

export const BookingModel = {
  async create(payload) {
    validateAndThrow('bookings', payload);
    const reference = collection.doc();
    await reference.set(payload);
    return reference.get();
  },

  async update(bookingId, payload) {
    const current = await collection.doc(bookingId).get();
    const merged = { ...(current.exists ? current.data() : {}), ...payload };
    const validation = validateCollectionPayload('bookings', merged);

    if (!validation.isValid) {
      throw new Error(`bookings validation failed: ${validation.errors.join('; ')}`);
    }

    await collection.doc(bookingId).set(payload, { merge: true });
    return collection.doc(bookingId).get();
  },

  async findById(bookingId) {
    return collection.doc(bookingId).get();
  }
};
