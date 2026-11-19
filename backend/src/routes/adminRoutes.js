const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken, requireRoles('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/reports', adminController.getReports);

module.exports = router;
