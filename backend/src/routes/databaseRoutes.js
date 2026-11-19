const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 13 Table Definitions & Seed Snapshot (Viva / Offline Inspector)
const TABLE_METADATA = {
  users: {
    description: 'User accounts with roles (STUDENT, INSTRUCTOR, ADMIN) and status states.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Unique user identifier' },
      { name: 'name', type: 'VARCHAR(100)', key: 'NOT NULL', description: 'Full name' },
      { name: 'email', type: 'VARCHAR(255)', key: 'UNIQUE', description: 'Unique login email' },
      { name: 'password_hash', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Bcrypt hashed password' },
      { name: 'role', type: 'VARCHAR(20)', key: 'CHECK', description: 'STUDENT | INSTRUCTOR | ADMIN' },
      { name: 'status', type: 'VARCHAR(20)', key: 'CHECK', description: 'ACTIVE | PENDING | DEACTIVATED' },
      { name: 'bio', type: 'TEXT', key: 'NULLABLE', description: 'Instructor/student biography' },
      { name: 'created_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', description: 'Account creation date' },
    ],
    sampleData: [
      { id: 1, name: 'Admin User', email: 'admin@skillbridge.edu', role: 'ADMIN', status: 'ACTIVE', bio: 'System Administrator' },
      { id: 2, name: 'Dr. Robert Smith', email: 'dr.smith@skillbridge.edu', role: 'INSTRUCTOR', status: 'ACTIVE', bio: 'Professor of Software Engineering' },
      { id: 3, name: 'Prof. Ada Sharma', email: 'prof.ada@skillbridge.edu', role: 'INSTRUCTOR', status: 'ACTIVE', bio: 'Database Architect' },
      { id: 4, name: 'Alice Walker', email: 'alice@student.edu', role: 'STUDENT', status: 'ACTIVE', bio: 'Junior CS Undergrad' },
      { id: 5, name: 'Bob Miller', email: 'bob@student.edu', role: 'STUDENT', status: 'ACTIVE', bio: 'SE Student' },
      { id: 6, name: 'Charlie Davis', email: 'charlie@student.edu', role: 'STUDENT', status: 'ACTIVE', bio: 'Enthusiastic Developer' },
      { id: 7, name: 'Diana Prince', email: 'diana@student.edu', role: 'STUDENT', status: 'ACTIVE', bio: 'Frontend Specialist' },
      { id: 8, name: 'Evan Wright', email: 'evan@student.edu', role: 'STUDENT', status: 'ACTIVE', bio: 'Data Structures Explorer' },
    ]
  },
  courses: {
    description: 'Course catalog entries created and published by instructors.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Unique course ID' },
      { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Course title' },
      { name: 'description', type: 'TEXT', key: 'NOT NULL', description: 'Course overview' },
      { name: 'category', type: 'VARCHAR(100)', key: 'NOT NULL', description: 'Discipline category' },
      { name: 'level', type: 'VARCHAR(50)', key: 'CHECK', description: 'Beginner | Intermediate | Advanced' },
      { name: 'instructor_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Assigned instructor' },
      { name: 'status', type: 'VARCHAR(20)', key: 'CHECK', description: 'DRAFT | PUBLISHED | ARCHIVED' },
      { name: 'created_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', description: 'Creation timestamp' },
    ],
    sampleData: [
      { id: 1, title: 'Full-Stack Web Engineering with React & Node', category: 'Web Development', level: 'Intermediate', instructor_id: 2, status: 'PUBLISHED' },
      { id: 2, title: 'Relational Database Design & PostgreSQL Mastery', category: 'Databases', level: 'Beginner', instructor_id: 3, status: 'PUBLISHED' },
      { id: 3, title: 'Data Structures & Algorithms in JavaScript', category: 'Computer Science', level: 'Intermediate', instructor_id: 2, status: 'PUBLISHED' },
    ]
  },
  enrollments: {
    description: 'Student course registrations with status tracking.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Enrollment record ID' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Registered student' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Target course' },
      { name: 'status', type: 'VARCHAR(20)', key: 'CHECK', description: 'ENROLLED | DROPPED | COMPLETED' },
      { name: 'enrolled_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', description: 'Registration date' },
    ],
    sampleData: [
      { id: 1, student_id: 4, course_id: 1, status: 'ENROLLED' },
      { id: 2, student_id: 4, course_id: 2, status: 'ENROLLED' },
      { id: 3, student_id: 5, course_id: 1, status: 'ENROLLED' },
      { id: 4, student_id: 5, course_id: 3, status: 'ENROLLED' },
      { id: 5, student_id: 6, course_id: 2, status: 'ENROLLED' },
      { id: 6, student_id: 7, course_id: 1, status: 'ENROLLED' },
      { id: 7, student_id: 8, course_id: 3, status: 'ENROLLED' },
    ]
  },
  modules: {
    description: 'Course sections organizing lessons and learning content.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Module ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Parent course' },
      { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Module title' },
      { name: 'description', type: 'TEXT', key: 'NULLABLE', description: 'Module summary' },
      { name: 'order_index', type: 'INTEGER', key: 'NOT NULL', description: 'Sequential position' },
    ],
    sampleData: [
      { id: 1, course_id: 1, title: 'Module 1: Architecture & Frontend Foundations', order_index: 1 },
      { id: 2, course_id: 1, title: 'Module 2: Layered REST APIs with Express', order_index: 2 },
      { id: 3, course_id: 2, title: 'Module 1: Database Fundamentals & Entity Modeling', order_index: 1 },
      { id: 4, course_id: 2, title: 'Module 2: Normalization & Complex SQL Queries', order_index: 2 },
      { id: 5, course_id: 3, title: 'Module 1: Linear Data Structures', order_index: 1 },
      { id: 6, course_id: 3, title: 'Module 2: Trees, Graphs & Algorithms', order_index: 2 },
    ]
  },
  materials: {
    description: 'Lessons, documents, links, and multimedia content inside modules.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Material ID' },
      { name: 'module_id', type: 'INTEGER', key: 'FK -> modules(id)', description: 'Parent module' },
      { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Lesson title' },
      { name: 'content_type', type: 'VARCHAR(20)', key: 'CHECK', description: 'VIDEO | PDF | LINK | TEXT' },
      { name: 'url_or_path', type: 'TEXT', key: 'NOT NULL', description: 'Resource URI or textual content' },
      { name: 'order_index', type: 'INTEGER', key: 'NOT NULL', description: 'Sequential position' },
    ],
    sampleData: [
      { id: 1, module_id: 1, title: 'React Component Lifecycle & Hooks Guide', content_type: 'PDF', url_or_path: 'https://react.dev/reference/react' },
      { id: 2, module_id: 1, title: 'Building Reactive Interfaces Video Lecture', content_type: 'VIDEO', url_or_path: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
      { id: 3, module_id: 1, title: 'Tailwind CSS Quick Reference', content_type: 'LINK', url_or_path: 'https://tailwindcss.com/docs' },
      { id: 4, module_id: 2, title: 'Express Layered Architecture Principles', content_type: 'TEXT', url_or_path: 'Separation of concerns between routes, controllers, and services.' },
      { id: 5, module_id: 2, title: 'REST API Security & JWT Authentication PDF', content_type: 'PDF', url_or_path: 'https://cheatsheetseries.owasp.org/' },
      { id: 6, module_id: 3, title: 'Relational Database Schema Design Primer', content_type: 'PDF', url_or_path: 'https://www.postgresql.org/docs/current/ddl.html' },
      { id: 7, module_id: 3, title: 'PostgreSQL Indexing Explained Video', content_type: 'VIDEO', url_or_path: 'https://www.youtube.com/watch?v=clrtTYP_h1c' },
    ]
  },
  quizzes: {
    description: 'Timed MCQ quizzes with pass thresholds and attempt limits.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Quiz ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Parent course' },
      { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Quiz title' },
      { name: 'time_limit_minutes', type: 'INTEGER', key: 'NOT NULL', description: 'Timer limit' },
      { name: 'total_marks', type: 'NUMERIC(5,2)', key: 'NOT NULL', description: 'Maximum score' },
      { name: 'passing_marks', type: 'NUMERIC(5,2)', key: 'NOT NULL', description: 'Passing threshold' },
      { name: 'max_attempts', type: 'INTEGER', key: 'NOT NULL', description: 'Permitted attempts' },
    ],
    sampleData: [
      { id: 1, course_id: 1, title: 'Quiz 1: React Fundamentals & Hooks', time_limit_minutes: 15, total_marks: 10.00, passing_marks: 6.00, max_attempts: 2 },
      { id: 2, course_id: 2, title: 'Quiz 1: Relational Schema & Normalization', time_limit_minutes: 20, total_marks: 10.00, passing_marks: 6.00, max_attempts: 1 },
      { id: 3, course_id: 3, title: 'Quiz 1: Data Structures Complexity Check', time_limit_minutes: 10, total_marks: 5.00, passing_marks: 3.00, max_attempts: 1 },
    ]
  },
  assignments: {
    description: 'Practical assignments with submission deadlines and marks.',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Assignment ID' },
      { name: 'course_id', type: 'INTEGER', key: 'FK -> courses(id)', description: 'Parent course' },
      { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', description: 'Assignment title' },
      { name: 'deadline', type: 'TIMESTAMPTZ', key: 'NOT NULL', description: 'Due date' },
      { name: 'total_marks', type: 'NUMERIC(5,2)', key: 'NOT NULL', description: 'Maximum marks' },
    ],
    sampleData: [
      { id: 1, course_id: 1, title: 'Build an Express REST API with Layered Architecture', total_marks: 100.00 },
      { id: 2, course_id: 2, title: 'Design an E-Commerce Relational Schema & 3NF Proof', total_marks: 100.00 },
      { id: 3, course_id: 3, title: 'Implement BFS and DFS Graph Algorithms in JavaScript', total_marks: 50.00 },
    ]
  },
  submissions: {
    description: 'Student assignment submissions with grading states (PENDING, SUBMITTED, LATE, GRADED).',
    columns: [
      { name: 'id', type: 'SERIAL', key: 'PRIMARY KEY', description: 'Submission ID' },
      { name: 'assignment_id', type: 'INTEGER', key: 'FK -> assignments(id)', description: 'Target assignment' },
      { name: 'student_id', type: 'INTEGER', key: 'FK -> users(id)', description: 'Submitting student' },
      { name: 'submission_type', type: 'VARCHAR(20)', key: 'CHECK', description: 'TEXT | LINK | FILE' },
      { name: 'state', type: 'VARCHAR(20)', key: 'CHECK', description: 'PENDING | SUBMITTED | LATE | GRADED' },
      { name: 'grade', type: 'NUMERIC(5,2)', key: 'NULLABLE', description: 'Instructor grade' },
      { name: 'feedback', type: 'TEXT', key: 'NULLABLE', description: 'Instructor feedback' },
    ],
    sampleData: [
      { id: 1, assignment_id: 1, student_id: 4, submission_type: 'LINK', state: 'SUBMITTED', grade: null, feedback: null },
      { id: 2, assignment_id: 2, student_id: 6, submission_type: 'TEXT', state: 'GRADED', grade: 95.00, feedback: 'Excellent schema design, clear justification for 3NF.' },
    ]
  }
};

// GET /api/database/tables - List all tables and metadata
router.get('/tables', async (req, res) => {
  const dbHealth = await testConnection();

  const tables = Object.keys(TABLE_METADATA).map((tableName) => ({
    name: tableName,
    description: TABLE_METADATA[tableName].description,
    columnCount: TABLE_METADATA[tableName].columns.length,
    rowCount: TABLE_METADATA[tableName].sampleData.length,
  }));

  return successResponse(res, {
    message: 'Database tables retrieved',
    data: {
      isLiveDb: dbHealth.connected,
      tables,
    },
  });
});

// GET /api/database/tables/:name - Get specific table schema and rows
router.get('/tables/:name', async (req, res) => {
  const tableName = req.params.name.toLowerCase();
  const meta = TABLE_METADATA[tableName];

  if (!meta) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Table "${tableName}" not found in schema definition`,
    });
  }

  const dbHealth = await testConnection();

  // If live PostgreSQL is connected, query live rows
  if (dbHealth.connected) {
    try {
      const allowedTables = Object.keys(TABLE_METADATA);
      if (allowedTables.includes(tableName)) {
        const queryRes = await pool.query(`SELECT * FROM ${tableName} LIMIT 50`);
        return successResponse(res, {
          message: `Live data retrieved for table: ${tableName}`,
          data: {
            table: tableName,
            description: meta.description,
            columns: meta.columns,
            rows: queryRes.rows,
            isLive: true,
          },
        });
      }
    } catch (err) {
      console.warn(`Query on live table "${tableName}" failed:`, err.message);
    }
  }

  // Fallback to pre-seeded schema snapshot
  return successResponse(res, {
    message: `Schema and pre-seeded snapshot for table: ${tableName}`,
    data: {
      table: tableName,
      description: meta.description,
      columns: meta.columns,
      rows: meta.sampleData,
      isLive: false,
    },
  });
});

module.exports = router;
