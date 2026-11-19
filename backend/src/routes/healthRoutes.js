const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('../controllers/healthController');

// GET /api/health - System and Database connectivity check
router.get('/', getHealthStatus);

module.exports = router;
