const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.post('/modules', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), materialController.createModule);
router.post('/', verifyToken, requireRoles('INSTRUCTOR', 'ADMIN'), materialController.createMaterial);
router.post('/:id/toggle-complete', verifyToken, requireRoles('STUDENT'), materialController.toggleComplete);

module.exports = router;
