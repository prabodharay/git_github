import { AuthService } from '../services/auth.service.js';
import { UserModel } from '../models/user.model.js';
import { sendError } from '../utils/http.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Missing bearer token', 401);
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    const decoded = await AuthService.verifyFirebaseToken(idToken);
    const userSnapshot = await UserModel.findById(decoded.uid);

    if (!userSnapshot.exists) {
      return sendError(res, 'User profile not found', 403);
    }

    req.auth = {
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
      role: userSnapshot.data().role,
      profile: userSnapshot.data()
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401, error.message);
  }
};
