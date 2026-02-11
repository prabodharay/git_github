import { db } from '../config/firebase.js';

const collection = db.collection('users');

export const UserModel = {
  async upsert(uid, payload) {
    const reference = collection.doc(uid);
    await reference.set(payload, { merge: true });
    return reference.get();
  },

  async findById(uid) {
    return collection.doc(uid).get();
  }
};
