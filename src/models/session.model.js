import { db } from '../config/firebase.js';

const collection = db.collection('sessions');

export const SessionModel = {
  async create(sessionId, payload) {
    await collection.doc(sessionId).set(payload);
    return collection.doc(sessionId).get();
  },

  async findById(sessionId) {
    return collection.doc(sessionId).get();
  },

  async revoke(sessionId) {
    await collection.doc(sessionId).set(
      {
        status: 'revoked',
        revokedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }
};
