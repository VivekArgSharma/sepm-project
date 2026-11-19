const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.get('/course/:courseId', verifyToken, assignmentController.getCourseAssignments);
router.get('/:id', verifyToken, assignmentController.getAssignmentById);
router.post('/', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), assignmentController.createAssignment);
router.post('/:id/submit', verifyToken, requireRoles('STUDENT'), assignmentController.submitAssignment);
router.get('/:id/submissions', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), assignmentController.getSubmissionsForAssignment);
router.post('/submissions/:submissionId/grade', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), assignmentController.gradeSubmission);

module.exports = router;
