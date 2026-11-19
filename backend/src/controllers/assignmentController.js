const assignmentService = require('../services/assignmentService');
const { successResponse } = require('../utils/apiResponse');

const getCourseAssignments = async (req, res, next) => {
  try {
    const studentId = req.user && req.user.role === 'STUDENT' ? req.user.id : null;
    const assignments = await assignmentService.getCourseAssignments(req.params.courseId, studentId);
    return successResponse(res, {
      message: 'Course assignments retrieved',
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    return successResponse(res, {
      message: 'Assignment details retrieved',
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const newAssignment = await assignmentService.createAssignment(
      req.body,
      req.user.id,
      req.user.role
    );
    return successResponse(res, {
      statusCode: 201,
      message: 'Assignment created successfully',
      data: newAssignment,
    });
  } catch (err) {
    next(err);
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    const { submission_type, content } = req.body;
    const submission = await assignmentService.submitAssignment({
      assignment_id: req.params.id,
      student_id: req.user.id,
      submission_type,
      content,
    });
    return successResponse(res, {
      statusCode: 201,
      message:
        submission.state === 'LATE'
          ? 'Assignment submitted after deadline (marked LATE)'
          : 'Assignment submitted successfully',
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const graded = await assignmentService.gradeSubmission(
      req.params.submissionId,
      req.user.id,
      req.body
    );
    return successResponse(res, {
      message: 'Submission graded successfully',
      data: graded,
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionsForAssignment = async (req, res, next) => {
  try {
    const submissions = await assignmentService.getSubmissionsForAssignment(req.params.id);
    return successResponse(res, {
      message: 'Submissions for assignment retrieved',
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsForAssignment,
};
