import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/signup-phone', async (req, res) => {
  try {
    const { phoneNumber, recaptchaToken, role = 'customer' } = req.body;

    const result = await AuthService.signupWithPhone({
      phoneNumber,
      recaptchaToken,
      role
    });

    return sendSuccess(
      res,
      {
        message: 'OTP sent successfully',
        ...result
      },
      201
    );
  } catch (error) {
    return sendError(res, 'Phone signup failed', 400, error.message);
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { sessionInfo, otpCode, role = 'customer' } = req.body;

    const result = await AuthService.verifyPhoneOtp({
      sessionInfo,
      otpCode,
      role
    });

    return sendSuccess(res, {
      message: 'OTP verified and session created',
      ...result
    });
  } catch (error) {
    return sendError(res, 'OTP verification failed', 401, error.message);
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshSession(refreshToken);
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'Token refresh failed', 401, error.message);
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const result = await AuthService.logout(req.auth.sessionId);
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'Logout failed', 400, error.message);
  }
});

router.get('/me', authenticate, async (req, res) => {
  return sendSuccess(res, {
    uid: req.auth.uid,
    role: req.auth.role,
    sessionId: req.auth.sessionId,
    profile: req.auth.profile
  });
});

export default router;
