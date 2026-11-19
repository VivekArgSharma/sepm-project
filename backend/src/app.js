/**
 * Express Application Setup
 * Configures security headers, CORS, body parsers, and route handlers.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/healthRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base Welcome Route
app.get('/', (req, res) => {
  res.json({
    project: 'SkillBridge - Online Skill-Based Learning & Course Management System',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api/health',
  });
});

// Health check endpoint
app.use('/api/health', healthRoutes);

// Database inspector & table viewer endpoint
app.use('/api/database', databaseRoutes);

// Placeholder mount points for subsequent phases
// Phase 2: app.use('/api/auth', authRoutes);
// Phase 3: app.use('/api/courses', courseRoutes);
// Phase 4: app.use('/api/quizzes', quizRoutes);
// Phase 5: app.use('/api/assignments', assignmentRoutes);
// Phase 6: app.use('/api/progress', progressRoutes);
// Phase 6: app.use('/api/admin', adminRoutes);

// Catch 404
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
