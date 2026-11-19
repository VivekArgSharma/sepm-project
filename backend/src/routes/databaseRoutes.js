const express = require('express');
const router = express.Router();
const dataStore = require('../config/dataStore');
const { testConnection } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const TABLE_SCHEMAS = {
  users: {
    description: 'System user accounts across Student, Instructor, and Admin roles.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Unique identifier' },
      { name: 'name', type: 'TEXT', key: 'NOT NULL', description: 'User full name' },
      { name: 'email', type: 'TEXT', key: 'UNIQUE', description: 'Account email address' },
      { name: 'role', type: 'TEXT', key: 'CHECK', description: 'STUDENT | INSTRUCTOR | ADMIN' },
      { name: 'status', type: 'TEXT', key: 'CHECK', description: 'ACTIVE | PENDING | DEACTIVATED' },
      { name: 'bio', type: 'TEXT', key: 'NULLABLE', description: 'Profile biography' },
      { name: 'created_at', type: 'DATETIME', key: 'DEFAULT NOW()', description: 'Registration timestamp' },
    ],
  },
  courses: {
    description: 'Course catalog published by instructors.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Course ID' },
      { name: 'title', type: 'TEXT', key: 'NOT NULL', description: 'Course title' },
      { name: 'description', type: 'TEXT', key: 'NOT NULL', description: 'Course overview' },
      { name: 'category', type: 'TEXT', key: 'NOT NULL', description: 'Domain / discipline' },
      { name: 'level', type: 'TEXT', key: 'CHECK', description: 'Beginner | Intermediate | Advanced' },
      { name: 'instructor_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Course owner' },
      { name: 'status', type: 'TEXT', key: 'CHECK', description: 'DRAFT | PUBLISHED | ARCHIVED' },
      { name: 'created_at', type: 'DATETIME', key: 'DEFAULT NOW()', description: 'Creation date' },
    ],
  },
  enrollments: {
    description: 'Student course registrations.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Enrollment ID' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Registered student' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Target course' },
      { name: 'status', type: 'TEXT', key: 'CHECK', description: 'ENROLLED | DROPPED | COMPLETED' },
      { name: 'enrolled_at', type: 'DATETIME', key: 'DEFAULT NOW()', description: 'Enrollment date' },
    ],
  },
  modules: {
    description: 'Course sections organizing lessons.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Module ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Parent course' },
      { name: 'title', type: 'TEXT', key: 'NOT NULL', description: 'Module title' },
      { name: 'description', type: 'TEXT', key: 'NULLABLE', description: 'Summary' },
      { name: 'order_index', type: 'INTEGER', key: 'NOT NULL', description: 'Display order' },
    ],
  },
  materials: {
    description: 'Lesson resources (Video/PDF links, text notes).',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Material ID' },
      { name: 'module_id', type: 'INTEGER', key: 'FK -> modules(id)', description: 'Parent module' },
      { name: 'title', type: 'TEXT', key: 'NOT NULL', description: 'Lesson title' },
      { name: 'content_type', type: 'TEXT', key: 'CHECK', description: 'VIDEO | PDF | LINK | TEXT' },
      { name: 'url_or_path', type: 'TEXT', key: 'NOT NULL', description: 'Resource URI or body' },
      { name: 'order_index', type: 'INTEGER', key: 'NOT NULL', description: 'Display order' },
    ],
  },
  material_progress: {
    description: 'Per-student completion tracking per lesson.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Progress ID' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Student' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Course' },
      { name: 'material_id', type: 'INTEGER', key: 'FK -> materials(id)', description: 'Lesson' },
      { name: 'completed', type: 'BOOLEAN', key: 'DEFAULT 0', description: 'Completion status' },
      { name: 'completed_at', type: 'DATETIME', key: 'NULLABLE', description: 'Completion date' },
    ],
  },
  quizzes: {
    description: 'MCQ timed assessments.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Quiz ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Course' },
      { name: 'title', type: 'TEXT', key: 'NOT NULL', description: 'Quiz title' },
      { name: 'time_limit_minutes', type: 'INTEGER', key: 'NOT NULL', description: 'Countdown limit' },
      { name: 'total_marks', type: 'REAL', key: 'NOT NULL', description: 'Maximum score' },
      { name: 'passing_marks', type: 'REAL', key: 'NOT NULL', description: 'Passing threshold' },
      { name: 'max_attempts', type: 'INTEGER', key: 'NOT NULL', description: 'Max attempts allowed' },
    ],
  },
  questions: {
    description: 'MCQ questions inside quizzes.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Question ID' },
      { name: 'quiz_id', type: 'INTEGER', key: 'FK -> quizzes(id)', description: 'Parent quiz' },
      { name: 'question_text', type: 'TEXT', key: 'NOT NULL', description: 'Question prompt' },
      { name: 'marks', type: 'REAL', key: 'NOT NULL', description: 'Weightage' },
      { name: 'order_index', type: 'INTEGER', key: 'NOT NULL', description: 'Display order' },
    ],
  },
  options: {
    description: 'Multiple choice options for questions.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Option ID' },
      { name: 'question_id', type: 'INTEGER', key: 'FK -> questions(id)', description: 'Parent question' },
      { name: 'option_text', type: 'TEXT', key: 'NOT NULL', description: 'Choice text' },
      { name: 'is_correct', type: 'BOOLEAN', key: 'NOT NULL', description: 'Answer key flag' },
    ],
  },
  quiz_attempts: {
    description: 'Student quiz attempts and state transitions.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Attempt ID' },
      { name: 'quiz_id', type: 'INTEGER', key: 'FK -> quizzes(id)', description: 'Quiz' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Student' },
      { name: 'attempt_number', type: 'INTEGER', key: 'NOT NULL', description: 'Attempt sequence' },
      { name: 'state', type: 'TEXT', key: 'CHECK', description: 'NOT_STARTED | IN_PROGRESS | SUBMITTED | EVALUATED' },
      { name: 'score', type: 'REAL', key: 'DEFAULT 0', description: 'Final score' },
      { name: 'start_time', type: 'DATETIME', key: 'DEFAULT NOW()', description: 'Start timestamp' },
      { name: 'submit_time', type: 'DATETIME', key: 'NULLABLE', description: 'Submission timestamp' },
    ],
  },
  attempt_answers: {
    description: 'Question choices selected during a quiz attempt.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Answer ID' },
      { name: 'attempt_id', type: 'INTEGER', key: 'FK -> quiz_attempts(id)', description: 'Attempt' },
      { name: 'question_id', type: 'INTEGER', key: 'FK -> questions(id)', description: 'Question' },
      { name: 'selected_option_id', type: 'INTEGER', key: 'FK -> options(id)', description: 'Choice selected' },
      { name: 'is_correct', type: 'BOOLEAN', key: 'DEFAULT 0', description: 'Auto-grade result' },
      { name: 'marks_awarded', type: 'REAL', key: 'DEFAULT 0', description: 'Points earned' },
    ],
  },
  assignments: {
    description: 'Practical assignments with deadlines.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Assignment ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Course' },
      { name: 'title', type: 'TEXT', key: 'NOT NULL', description: 'Title' },
      { name: 'deadline', type: 'DATETIME', key: 'NOT NULL', description: 'Submission deadline' },
      { name: 'total_marks', type: 'REAL', key: 'NOT NULL', description: 'Maximum marks' },
    ],
  },
  submissions: {
    description: 'Student assignment submissions and grades.',
    columns: [
      { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY', description: 'Submission ID' },
      { name: 'assignment_id', type: 'INTEGER', key: 'FK -> assignments(id)', description: 'Assignment' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Student' },
      { name: 'submission_type', type: 'TEXT', key: 'CHECK', description: 'TEXT | LINK | FILE' },
      { name: 'content', type: 'TEXT', key: 'NOT NULL', description: 'Submitted answer' },
      { name: 'state', type: 'TEXT', key: 'CHECK', description: 'PENDING | SUBMITTED | LATE | GRADED' },
      { name: 'grade', type: 'REAL', key: 'NULLABLE', description: 'Assigned score' },
      { name: 'feedback', type: 'TEXT', key: 'NULLABLE', description: 'Instructor remarks' },
    ],
  },
};

// GET /api/database/tables - List all 13 tables
router.get('/tables', async (req, res) => {
  const dbHealth = await testConnection();
  const tables = Object.keys(TABLE_SCHEMAS).map((name) => {
    const rows = dataStore.getTable(name);
    return {
      name,
      description: TABLE_SCHEMAS[name].description,
      columnCount: TABLE_SCHEMAS[name].columns.length,
      rowCount: rows.length,
    };
  });

  return successResponse(res, {
    message: 'Database tables retrieved',
    data: {
      isLiveDb: dbHealth.connected,
      engine: dbHealth.engine,
      tables,
    },
  });
});

// GET /api/database/tables/:name - Get table details & real-time rows
router.get('/tables/:name', async (req, res) => {
  const tableName = req.params.name.toLowerCase();
  const schema = TABLE_SCHEMAS[tableName];

  if (!schema) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Table "${tableName}" not found`,
    });
  }

  const rows = dataStore.getTable(tableName);

  return successResponse(res, {
    message: `Table data for: ${tableName}`,
    data: {
      table: tableName,
      description: schema.description,
      columns: schema.columns,
      rows,
      isLive: true,
    },
  });
});

module.exports = router;
