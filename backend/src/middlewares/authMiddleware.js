const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_key_min32chars';

/**
 * Verify JWT Bearer Token Middleware
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find user in dataStore to ensure active account
    const users = dataStore.getTable('users');
    const user = users.find((u) => Number(u.id) === Number(decoded.id));

    if (!user) {
      return next(new AppError('The account belonging to this token no longer exists.', 401));
    }

    if (user.status === 'DEACTIVATED') {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * @param  {...string} roles Allowed roles (STUDENT, INSTRUCTOR, ADMIN)
 */
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User authentication not established.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of roles: [${roles.join(', ')}]. You are: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRoles,
};
