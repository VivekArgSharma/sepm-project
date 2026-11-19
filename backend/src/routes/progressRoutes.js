const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.get('/courses/:courseId/student', verifyToken, progressController.getStudentProgress);
router.get('/courses/:courseId/class', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), progressController.getClassProgress);

module.exports = router;
