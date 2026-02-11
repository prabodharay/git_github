import admin, { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';

export const AuthService = {
  async verifyFirebaseToken(idToken) {
    return auth.verifyIdToken(idToken);
  },

  async registerOrUpdateUser({ uid, phoneNumber, role = 'customer' }) {
    const now = admin.firestore.FieldValue.serverTimestamp();

    const snapshot = await UserModel.findById(uid);
    const existingData = snapshot.exists ? snapshot.data() : {};

    const payload = {
      uid,
      phone: phoneNumber,
      role: existingData.role || role,
      status: existingData.status || 'active',
      createdAt: existingData.createdAt || now,
      updatedAt: now
    };

    const updated = await UserModel.upsert(uid, payload);
    return { id: updated.id, ...updated.data() };
  }
};
