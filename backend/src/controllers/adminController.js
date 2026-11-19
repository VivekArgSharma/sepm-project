const adminService = require('../services/adminService');
const { successResponse } = require('../utils/apiResponse');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return successResponse(res, {
      message: 'System users list retrieved',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const updated = await adminService.updateUserStatus(req.params.id, req.body.status);
    return successResponse(res, {
      message: `User status updated to ${req.body.status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getSystemReports();
    return successResponse(res, {
      message: 'System reports and metrics retrieved',
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getReports,
};
