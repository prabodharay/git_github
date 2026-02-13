import { apiClient } from './client';

export const pricingApi = {
  updatePricing: (vehicleType, payload) =>
    apiClient.post(`/pricing/pricing/${vehicleType}`, payload),
  calculateFare: (payload) => apiClient.post('/pricing/fare/calculate', payload)
};
