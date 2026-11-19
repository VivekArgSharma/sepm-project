const { testConnection } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Health check controller
 * Checks API server state and database connection health
 */
const getHealthStatus = async (req, res) => {
  const dbHealth = await testConnection();

  const healthData = {
    service: 'SkillBridge REST API',
    status: dbHealth.connected ? 'HEALTHY' : 'DEGRADED',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
  };

  if (!dbHealth.connected) {
    return errorResponse(res, {
      statusCode: 503,
      message: 'Service degraded: Database connection is unavailable',
      errors: healthData,
    });
  }

  return successResponse(res, {
    statusCode: 200,
    message: 'SkillBridge API and PostgreSQL are operational',
    data: healthData,
  });
};

module.exports = {
  getHealthStatus,
};
