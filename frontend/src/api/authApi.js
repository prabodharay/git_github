import { apiClient } from './client';

export const authApi = {
  signupPhone: (payload) => apiClient.post('/auth/signup-phone', payload),
  verifyOtp: (payload) => apiClient.post('/auth/verify-otp', payload),
  me: () => apiClient.get('/auth/me')
};
