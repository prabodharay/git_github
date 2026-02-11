import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { BookingModel } from '../models/booking.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { TransactionModel } from '../models/transaction.model.js';
import { NotificationService } from './notification.service.js';

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret
});

const toPaise = (amount) => Math.round(Number(amount) * 100);

export const PaymentService = {
  async createPaymentOrder({ bookingId, customerId }) {
    const bookingSnapshot = await BookingModel.findById(bookingId);

    if (!bookingSnapshot.exists) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnapshot.data();

    if (booking.customerId !== customerId) {
      throw new Error('You cannot create payment for this booking');
    }

    const amount = Number(booking.fare || 0);
    if (amount <= 0) {
      throw new Error('Invalid booking fare amount');
    }

    const order = await razorpay.orders.create({
      amount: toPaise(amount),
      currency: env.razorpayCurrency,
      receipt: bookingId,
      notes: {
        bookingId,
        customerId,
        vehicleType: booking.vehicleType || ''
      }
    });

    await BookingModel.update(bookingId, {
      paymentStatus: 'order_created',
      paymentOrderId: order.id,
      updatedAt: new Date().toISOString()
    });

    return {
      bookingId,
      amount,
      currency: env.razorpayCurrency,
      orderId: order.id,
      razorpayKeyId: env.razorpayKeyId
    };
  },

  verifyWebhookSignature({ rawBody, signature }) {
    const expectedSignature = crypto
      .createHmac('sha256', env.razorpayWebhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  },

  async handleWebhookEvent({ event, payload }) {
    if (event !== 'payment.captured') {
      return { ignored: true, reason: `Unhandled event ${event}` };
    }

    const paymentEntity = payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId || !paymentId) {
      throw new Error('Invalid webhook payload for payment.captured');
    }

    const bookings = await BookingModel.listAll(200);
    const booking = bookings.find((item) => item.paymentOrderId === orderId);

    if (!booking) {
      throw new Error('Booking not found for payment order');
    }

    if (booking.paymentStatus === 'paid') {
      return { alreadyProcessed: true, bookingId: booking.id };
    }

    await BookingModel.update(booking.id, {
      paymentStatus: 'paid',
      paymentId,
      paymentOrderId: orderId,
      paymentCapturedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (booking.driverId) {
      await WalletModel.credit(booking.driverId, Number(booking.fare || 0));

      await TransactionModel.create({
        driverId: booking.driverId,
        bookingId: booking.id,
        amount: Number(booking.fare || 0),
        type: 'credit',
        note: 'Razorpay payment captured; driver wallet credited',
        createdAt: new Date().toISOString()
      });
    }

    await NotificationService.sendToTopic(
      `booking_${booking.id}`,
      'Payment successful',
      `Payment captured for booking ${booking.id}`,
      {
        bookingId: booking.id,
        paymentStatus: 'paid'
      }
    );

    return {
      processed: true,
      bookingId: booking.id,
      paymentId
    };
  }
};
