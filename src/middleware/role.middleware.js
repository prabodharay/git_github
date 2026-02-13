import { sendError } from '../utils/http.js';

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return sendError(res, 'Unauthorized', 401);
  }

  if (!allowedRoles.includes(req.auth.role)) {
    return sendError(
      res,
      `Role ${req.auth.role} is not allowed for this route`,
      403
    );
  }

  return next();
};
