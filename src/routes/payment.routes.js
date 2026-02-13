import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { PaymentService } from '../services/payment.service.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/orders', authenticate, authorizeRoles('customer'), async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return sendError(res, 'bookingId is required', 400);
    }

    const result = await PaymentService.createPaymentOrder({
      bookingId,
      customerId: req.auth.uid
    });

    return sendSuccess(res, result, 201);
  } catch (error) {
    return sendError(res, 'Unable to create payment order', 400, error.message);
  }
});

router.post('/webhook/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return sendError(res, 'Missing x-razorpay-signature header', 401);
    }

    const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(req.body || {});
    const isValid = PaymentService.verifyWebhookSignature({ rawBody, signature });

    if (!isValid) {
      return sendError(res, 'Invalid webhook signature', 401);
    }

    const result = await PaymentService.handleWebhookEvent({
      event: req.body?.event,
      payload: req.body?.payload
    });

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'Webhook processing failed', 400, error.message);
  }
});

export default router;
