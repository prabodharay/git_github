import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { sendError, sendSuccess } from '../../utils/http.js';
import { DriverModel } from '../../models/driver.model.js';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.patch('/drivers/:driverId/approval', async (req, res) => {
  try {
    const { status = 'approved' } = req.body;
    const allowed = ['approved', 'rejected', 'suspended'];

    if (!allowed.includes(status)) {
      return sendError(res, 'Invalid driver status', 400, { allowed });
    }

    await DriverModel.update(req.params.driverId, {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: req.auth.uid
    });

    return sendSuccess(res, {
      driverId: req.params.driverId,
      status
    });
  } catch (error) {
    return sendError(res, 'Unable to update driver approval', 400, error.message);
  }
});

export default router;
