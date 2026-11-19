const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Centralized Error Handling Middleware
 * Catches all operational and unexpected runtime errors.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';

  // In production, do not leak raw stack traces to the client
  const errors = process.env.NODE_ENV === 'development'
    ? err.errors || { stack: err.stack }
    : err.errors || null;

  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors,
  });
};

module.exports = errorHandler;
