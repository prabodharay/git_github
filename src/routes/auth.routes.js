import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return sendError(res, 'idToken is required', 400);
    }

    const decoded = await AuthService.verifyFirebaseToken(idToken);

    const user = await AuthService.registerOrUpdateUser({
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
      role: role || 'customer'
    });

    return sendSuccess(res, {
      message: 'OTP token verified successfully',
      user
    });
  } catch (error) {
    return sendError(res, 'Login failed', 401, error.message);
  }
});

export default router;
