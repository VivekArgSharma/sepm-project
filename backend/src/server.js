/**
 * HTTP Server Entrypoint
 */

const app = require('./app');
const { testConnection, dbType } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(` SkillBridge Backend API Server running on port ${PORT}`);
    console.log(` Engine: ${dbType.toUpperCase()}`);
    console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(` Table Explorer: http://localhost:${PORT}/api/database/tables`);
    console.log(`====================================================`);

    const dbStatus = await testConnection();
    if (dbStatus.connected) {
      console.log(`[Database] Active: ${dbStatus.engine} (${dbStatus.database || 'ready'})`);
    } else {
      console.warn(`[Database Warning] ${dbStatus.error}`);
    }
  });

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
