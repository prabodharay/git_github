import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { FareService } from '../services/fare.service.js';
import { PricingModel } from '../models/pricing.model.js';
import { sendError, sendSuccess } from '../utils/http.js';

const router = Router();

router.post('/fare/calculate', authenticate, async (req, res) => {
  try {
    const { vehicleType, distanceKm } = req.body;

    if (!vehicleType || Number(distanceKm) <= 0) {
      return sendError(res, 'vehicleType and valid distanceKm are required');
    }

    const result = await FareService.calculateFare({ vehicleType, distanceKm });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'Fare calculation failed', 400, error.message);
  }
});

router.post(
  '/pricing/:vehicleType',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { vehicleType } = req.params;
      const payload = {
        baseFare: Number(req.body.baseFare),
        perKmRate: Number(req.body.perKmRate),
        surgeMultiplier: Number(req.body.surgeMultiplier || 1),
        updatedAt: new Date().toISOString(),
        updatedBy: req.auth.uid
      };

      const updated = await PricingModel.upsert(vehicleType, payload);
      return sendSuccess(res, { vehicleType: updated.id, ...updated.data() });
    } catch (error) {
      return sendError(res, 'Unable to update pricing rule', 400, error.message);
    }
  }
);

export default router;
