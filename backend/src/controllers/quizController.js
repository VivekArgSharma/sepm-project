const quizService = require('../services/quizService');
const { successResponse } = require('../utils/apiResponse');

const getCourseQuizzes = async (req, res, next) => {
  try {
    const studentId = req.user && req.user.role === 'STUDENT' ? req.user.id : null;
    const quizzes = await quizService.getCourseQuizzes(req.params.courseId, studentId);
    return successResponse(res, {
      message: 'Course quizzes retrieved',
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'STUDENT';
    const quiz = await quizService.getQuizById(req.params.id, role);
    return successResponse(res, {
      message: 'Quiz details retrieved',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.body, req.user.id, req.user.role);
    return successResponse(res, {
      statusCode: 201,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

const startAttempt = async (req, res, next) => {
  try {
    const session = await quizService.startAttempt(req.params.id, req.user.id);
    return successResponse(res, {
      statusCode: 201,
      message: session.resumed ? 'Resumed active quiz attempt' : 'Quiz attempt initialized',
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { answers, isAutoExpired } = req.body;
    const evaluation = await quizService.submitAttempt(
      req.params.id,
      req.user.id,
      answers,
      isAutoExpired
    );
    return successResponse(res, {
      message: 'Quiz attempt evaluated successfully',
      data: evaluation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourseQuizzes,
  getQuizById,
  createQuiz,
  startAttempt,
  submitAttempt,
};
