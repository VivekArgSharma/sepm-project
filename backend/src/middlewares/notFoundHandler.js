const AppError = require('../utils/AppError');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFoundHandler;
