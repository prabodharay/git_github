import { apiClient } from './client';

export const bookingApi = {
  createBooking: (payload) => apiClient.post('/bookings', payload),
  listBookings: () => apiClient.get('/bookings'),
  getStatus: (bookingId) => apiClient.get(`/bookings/${bookingId}/status`)
};
