const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

// Public catalog
router.get('/', courseController.getAllCourses);

// Student enrolled courses
router.get('/my/enrolled', verifyToken, requireRoles('STUDENT'), courseController.getMyEnrolledCourses);

// Instructor's own courses
router.get('/my/teaching', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), courseController.getMyInstructorCourses);

// Optional auth course detail view (supports guest viewing or customized for logged in user)
router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => courseController.getCourseById(req, res, next));
  }
  return courseController.getCourseById(req, res, next);
});

// Instructor / Admin Course CRUD
router.post('/', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), courseController.createCourse);
router.put('/:id', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), courseController.updateCourse);
router.delete('/:id', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), courseController.deleteCourse);

// Student Enrollment
router.post('/:id/enroll', verifyToken, requireRoles('STUDENT'), courseController.enroll);
router.delete('/:id/unenroll', verifyToken, requireRoles('STUDENT'), courseController.unenroll);

module.exports = router;
