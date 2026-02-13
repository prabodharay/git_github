import { sendError } from '../utils/http.js';

export const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  return sendError(
    res,
    'Unexpected server error',
    500,
    process.env.NODE_ENV === 'development' ? error.message : null
  );
};
