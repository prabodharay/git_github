import admin from '../config/firebase.js';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { SessionModel } from '../models/session.model.js';
import {
  generateSessionId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';

const OTP_SEND_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${env.firebaseWebApiKey}`;
const OTP_VERIFY_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${env.firebaseWebApiKey}`;

const allowedRoles = ['customer', 'driver', 'admin'];

const validateRole = (role) => {
  if (!allowedRoles.includes(role)) {
    throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
  }
};

export const AuthService = {
  async signupWithPhone({ phoneNumber, recaptchaToken, role = 'customer' }) {
    validateRole(role);

    if (!phoneNumber || !recaptchaToken) {
      throw new Error('phoneNumber and recaptchaToken are required');
    }

    const response = await fetch(OTP_SEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        recaptchaToken
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Failed to send OTP');
    }

    return {
      phoneNumber,
      role,
      sessionInfo: payload.sessionInfo
    };
  },

  async verifyPhoneOtp({ sessionInfo, otpCode, role = 'customer' }) {
    validateRole(role);

    if (!sessionInfo || !otpCode) {
      throw new Error('sessionInfo and otpCode are required');
    }

    const otpResponse = await fetch(OTP_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionInfo,
        code: otpCode
      })
    });

    const otpPayload = await otpResponse.json();

    if (!otpResponse.ok) {
      throw new Error(otpPayload?.error?.message || 'OTP verification failed');
    }

    const uid = otpPayload.localId;
    const phoneNumber = otpPayload.phoneNumber;
    const now = admin.firestore.FieldValue.serverTimestamp();

    const userSnapshot = await UserModel.findById(uid);
    const existing = userSnapshot.exists ? userSnapshot.data() : {};

    const userPayload = {
      uid,
      phone: phoneNumber,
      role: existing.role || role,
      status: existing.status || 'active',
      createdAt: existing.createdAt || now,
      updatedAt: now,
      lastLoginAt: now
    };

    const userRef = await UserModel.upsert(uid, userPayload);

    const sessionId = generateSessionId();
    const sessionRecord = {
      uid,
      role: userPayload.role,
      status: 'active',
      provider: 'phone_otp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await SessionModel.create(sessionId, sessionRecord);

    const accessToken = signAccessToken({ uid, role: userPayload.role, sessionId });
    const refreshToken = signRefreshToken({ uid, role: userPayload.role, sessionId });

    return {
      user: { id: userRef.id, ...userRef.data() },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer'
      }
    };
  },

  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw new Error('refreshToken is required');
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const sessionSnapshot = await SessionModel.findById(decoded.sessionId);
    if (!sessionSnapshot.exists || sessionSnapshot.data().status !== 'active') {
      throw new Error('Session is invalid or revoked');
    }

    const newAccessToken = signAccessToken({
      uid: decoded.uid,
      role: decoded.role,
      sessionId: decoded.sessionId
    });

    return {
      accessToken: newAccessToken,
      tokenType: 'Bearer'
    };
  },

  async logout(sessionId) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    await SessionModel.revoke(sessionId);
    return { loggedOut: true };
  }
};
