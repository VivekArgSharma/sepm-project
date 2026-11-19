/**
 * Express Application Setup
 * Connects layered API routes, security headers, CORS, body parsers, and centralized error handlers.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/healthRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const materialRoutes = require('./routes/materialRoutes');
const quizRoutes = require('./routes/quizRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// HTTP request logger (disabled during automated tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome ping
app.get('/', (req, res) => {
  res.json({
    project: 'SkillBridge - Online Skill-Based Learning & Course Management System',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api/health',
  });
});

// REST API Module Mount Points
app.use('/api/health', healthRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Catch 404 for unmapped endpoints
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
