const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.get('/course/:courseId', verifyToken, quizController.getCourseQuizzes);
router.get('/:id', verifyToken, quizController.getQuizById);
router.post('/', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), quizController.createQuiz);
router.post('/:id/start', verifyToken, requireRoles('STUDENT'), quizController.startAttempt);
router.post('/:id/submit', verifyToken, requireRoles('STUDENT'), quizController.submitAttempt);

module.exports = router;
