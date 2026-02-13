import { db } from '../config/firebase.js';
import { validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('users');

export const UserModel = {
  async upsert(uid, payload) {
    validateAndThrow('users', payload);
    const reference = collection.doc(uid);
    await reference.set(payload, { merge: true });
    return reference.get();
  },

  async findById(uid) {
    return collection.doc(uid).get();
  }
};
