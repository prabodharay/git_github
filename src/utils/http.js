export const sendSuccess = (res, data, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const sendError = (res, message, status = 400, details = null) => {
  res.status(status).json({
    success: false,
    error: {
      message,
      details
    }
  });
};
