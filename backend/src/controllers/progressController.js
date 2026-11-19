const progressService = require('../services/progressService');
const { successResponse } = require('../utils/apiResponse');

const getStudentProgress = async (req, res, next) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : req.user.id;
    const progress = await progressService.getStudentProgress(req.params.courseId, studentId);
    return successResponse(res, {
      message: 'Student course progress retrieved',
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};

const getClassProgress = async (req, res, next) => {
  try {
    const classProgress = await progressService.getClassProgress(
      req.params.courseId,
      req.user.id,
      req.user.role
    );
    return successResponse(res, {
      message: 'Class progress analytics retrieved',
      data: classProgress,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentProgress,
  getClassProgress,
};
