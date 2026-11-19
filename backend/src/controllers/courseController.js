const courseService = require('../services/courseService');
const { successResponse } = require('../utils/apiResponse');

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses(req.query);
    return successResponse(res, {
      message: 'Courses catalog retrieved',
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const course = await courseService.getCourseById(req.params.id, currentUserId);
    return successResponse(res, {
      message: 'Course details retrieved',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse({
      ...req.body,
      instructorId: req.user.id,
    });
    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const updated = await courseService.updateCourse(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    return successResponse(res, {
      message: 'Course updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
    return successResponse(res, {
      message: 'Course deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const enroll = async (req, res, next) => {
  try {
    const enrollment = await courseService.enrollStudent(req.params.id, req.user.id);
    return successResponse(res, {
      statusCode: 201,
      message: 'Enrolled in course successfully',
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};

const unenroll = async (req, res, next) => {
  try {
    await courseService.unenrollStudent(req.params.id, req.user.id);
    return successResponse(res, {
      message: 'Unenrolled from course successfully',
    });
  } catch (err) {
    next(err);
  }
};

const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getStudentCourses(req.user.id);
    return successResponse(res, {
      message: 'Student enrolled courses retrieved',
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

const getMyInstructorCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id);
    return successResponse(res, {
      message: 'Instructor courses retrieved',
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enroll,
  unenroll,
  getMyEnrolledCourses,
  getMyInstructorCourses,
};
