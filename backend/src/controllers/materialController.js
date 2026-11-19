const materialService = require('../services/materialService');
const { successResponse } = require('../utils/apiResponse');

const createModule = async (req, res, next) => {
  try {
    const newModule = await materialService.createModule(req.body, req.user.id, req.user.role);
    return successResponse(res, {
      statusCode: 201,
      message: 'Course module created successfully',
      data: newModule,
    });
  } catch (err) {
    next(err);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const newMaterial = await materialService.createMaterial(req.body, req.user.id, req.user.role);
    return successResponse(res, {
      statusCode: 201,
      message: 'Learning material created successfully',
      data: newMaterial,
    });
  } catch (err) {
    next(err);
  }
};

const toggleComplete = async (req, res, next) => {
  try {
    const progress = await materialService.toggleMaterialCompletion(req.params.id, req.user.id);
    return successResponse(res, {
      message: 'Lesson completion status updated',
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createModule,
  createMaterial,
  toggleComplete,
};
