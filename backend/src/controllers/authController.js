const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Account registered successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  // JWT tokens are stateless, so logout is client-side clearance, but we respond with success
  return successResponse(res, {
    statusCode: 200,
    message: 'Logged out successfully',
  });
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Current profile retrieved',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
