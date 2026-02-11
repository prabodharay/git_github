import { db } from '../config/firebase.js';

const collection = db.collection('bookings');

export const BookingModel = {
  async create(payload) {
    const reference = collection.doc();
    await reference.set(payload);
    return reference.get();
  },

  async update(bookingId, payload) {
    await collection.doc(bookingId).set(payload, { merge: true });
    return collection.doc(bookingId).get();
  },

  async findById(bookingId) {
    return collection.doc(bookingId).get();
  }
};
