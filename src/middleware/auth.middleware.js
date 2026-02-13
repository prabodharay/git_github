import { UserModel } from '../models/user.model.js';
import { SessionModel } from '../models/session.model.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/http.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Missing bearer token', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return sendError(res, 'Invalid token type', 401);
    }

    const sessionSnapshot = await SessionModel.findById(decoded.sessionId);
    if (!sessionSnapshot.exists || sessionSnapshot.data().status !== 'active') {
      return sendError(res, 'Session expired or revoked', 401);
    }

    const userSnapshot = await UserModel.findById(decoded.uid);

    if (!userSnapshot.exists) {
      return sendError(res, 'User profile not found', 403);
    }

    req.auth = {
      uid: decoded.uid,
      role: decoded.role,
      sessionId: decoded.sessionId,
      profile: userSnapshot.data()
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401, error.message);
  }
};
