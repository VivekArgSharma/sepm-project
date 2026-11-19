/**
 * HTTP Server Entrypoint
 */

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(` SkillBridge Backend API Server running on port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);

    // Check DB connectivity on startup
    const dbStatus = await testConnection();
    if (dbStatus.connected) {
      console.log(`[Database] Connected successfully to PostgreSQL (${dbStatus.database})`);
    } else {
      console.warn(`[Database Warning] Unable to connect to PostgreSQL: ${dbStatus.error}`);
      console.warn(`Make sure PostgreSQL is running and credentials in .env are configured.`);
    }
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\nReceived kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
