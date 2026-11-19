/**
 * Standard API Response Utility
 * Ensures consistent JSON responses across all REST endpoints.
 * PRD requirement: "Return consistent JSON error responses."
 */

const successResponse = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const responseBody = {
    success: true,
    message,
    data,
  };

  if (meta) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
};

const errorResponse = (res, { statusCode = 500, message = 'Internal Server Error', errors = null } = {}) => {
  const responseBody = {
    success: false,
    message,
  };

  if (errors) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  successResponse,
  errorResponse,
};
