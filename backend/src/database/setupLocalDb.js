/**
 * Local Database Auto-Setup Script
 * Creates all 13 normalized tables in SQLite if they do not exist,
 * and seeds them with demo data (1 admin, 2 instructors, 5 students, 3 courses).
 */

const { query } = require('../config/db');

const demoPasswordHash = '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO'; // Password123!

async function setupLocalTables() {
  // Check if users table already exists
  const check = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  if (check.rows.length > 0) {
    return; // Already initialized
  }

  console.log('[Local DB] Initializing tables and seeding demo data in SQLite...');

  // 1. Users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'DEACTIVATED')),
      bio TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Courses
  await query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
      thumbnail_url TEXT,
      instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Enrollments
  await query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'DROPPED', 'COMPLETED')),
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (student_id, course_id)
    )
  `);

  // 4. Modules
  await query(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Materials
  await query(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      content_type TEXT NOT NULL CHECK (content_type IN ('VIDEO', 'PDF', 'LINK', 'TEXT')),
      url_or_path TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Material Progress
  await query(`
    CREATE TABLE IF NOT EXISTS material_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at DATETIME,
      UNIQUE (student_id, material_id)
    )
  `);

  // 7. Quizzes
  await query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      time_limit_minutes INTEGER NOT NULL DEFAULT 15,
      total_marks REAL NOT NULL DEFAULT 10.00,
      passing_marks REAL NOT NULL DEFAULT 5.00,
      max_attempts INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Questions
  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      marks REAL NOT NULL DEFAULT 1.00,
      order_index INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 9. Options
  await query(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 1
    )
  `);

  // 10. Quiz Attempts
  await query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attempt_number INTEGER NOT NULL DEFAULT 1,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      submit_time DATETIME,
      score REAL DEFAULT 0.00,
      state TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (state IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (quiz_id, student_id, attempt_number)
    )
  `);

  // 11. Attempt Answers
  await query(`
    CREATE TABLE IF NOT EXISTS attempt_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      selected_option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
      is_correct INTEGER DEFAULT 0,
      marks_awarded REAL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (attempt_id, question_id)
    )
  `);

  // 12. Assignments
  await query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      deadline DATETIME NOT NULL,
      total_marks REAL NOT NULL DEFAULT 100.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 13. Submissions
  await query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      submission_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (submission_type IN ('TEXT', 'LINK', 'FILE')),
      content TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      state TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (state IN ('PENDING', 'SUBMITTED', 'LATE', 'GRADED')),
      grade REAL,
      feedback TEXT,
      graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      graded_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (assignment_id, student_id)
    )
  `);

  // Seed Users: 1 Admin, 2 Instructors, 5 Students
  await query(`
    INSERT INTO users (id, name, email, password_hash, role, status, bio) VALUES
    (1, 'Admin User', 'admin@skillbridge.edu', $1, 'ADMIN', 'ACTIVE', 'System Administrator with overall management rights.'),
    (2, 'Dr. Robert Smith', 'dr.smith@skillbridge.edu', $1, 'INSTRUCTOR', 'ACTIVE', 'Professor of Software Engineering and Full-Stack Web Development.'),
    (3, 'Prof. Ada Sharma', 'prof.ada@skillbridge.edu', $1, 'INSTRUCTOR', 'ACTIVE', 'Database Architect, SQL Specialist, and Systems Researcher.'),
    (4, 'Alice Walker', 'alice@student.edu', $1, 'STUDENT', 'ACTIVE', 'Junior CS undergrad passionate about full-stack web development.'),
    (5, 'Bob Miller', 'bob@student.edu', $1, 'STUDENT', 'ACTIVE', 'Software Engineering student interested in backend architectures.'),
    (6, 'Charlie Davis', 'charlie@student.edu', $1, 'STUDENT', 'ACTIVE', 'Enthusiastic developer learning SQL databases and API design.'),
    (7, 'Diana Prince', 'diana@student.edu', $1, 'STUDENT', 'ACTIVE', 'Frontend enthusiast building interactive UI systems.'),
    (8, 'Evan Wright', 'evan@student.edu', $1, 'STUDENT', 'ACTIVE', 'Undergraduate exploring data structures and algorithms.')
  `, [demoPasswordHash]);

  // Seed Courses
  await query(`
    INSERT INTO courses (id, title, description, category, level, instructor_id, status) VALUES
    (1, 'Full-Stack Web Engineering with React & Node', 'Master modern web development from UI design to server-side REST APIs, middleware architectures, and database persistence.', 'Web Development', 'Intermediate', 2, 'PUBLISHED'),
    (2, 'Relational Database Design & PostgreSQL Mastery', 'In-depth coverage of 1NF to BCNF normalization, relational algebra, SQL optimization, transactions, and indexing.', 'Databases', 'Beginner', 3, 'PUBLISHED'),
    (3, 'Data Structures & Algorithms in JavaScript', 'Practical understanding of arrays, linked lists, hash tables, trees, graphs, sorting, and algorithmic complexity.', 'Computer Science', 'Intermediate', 2, 'PUBLISHED')
  `);

  // Seed Modules
  await query(`
    INSERT INTO modules (id, course_id, title, description, order_index) VALUES
    (1, 1, 'Module 1: Architecture & Frontend Foundations', 'Component design, Vite tooling, and state management in React.', 1),
    (2, 1, 'Module 2: Layered REST APIs with Express', 'Routes, controllers, services, middleware, and error handling.', 2),
    (3, 2, 'Module 1: Database Fundamentals & Entity Modeling', 'Relational models, ER diagrams, primary keys, and foreign keys.', 1),
    (4, 2, 'Module 2: Normalization & Complex SQL Queries', 'Eliminating redundancy with 1NF, 2NF, 3NF, BCNF, and joins.', 2),
    (5, 3, 'Module 1: Linear Data Structures', 'Stacks, Queues, Linked Lists and time-complexity trade-offs.', 1),
    (6, 3, 'Module 2: Trees, Graphs & Algorithms', 'Binary search trees, traversals, and dynamic programming.', 2)
  `);

  // Seed Materials
  await query(`
    INSERT INTO materials (id, module_id, title, description, content_type, url_or_path, order_index) VALUES
    (1, 1, 'React Component Lifecycle & Hooks Guide', 'Comprehensive guide to useState, useEffect, and custom hooks.', 'PDF', 'https://react.dev/reference/react', 1),
    (2, 1, 'Building Reactive Interfaces Video Lecture', 'Video walkthrough of modern React 18 component composition.', 'VIDEO', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
    (3, 1, 'Tailwind CSS Quick Reference', 'Core utility classes, grid systems, and responsive design patterns.', 'LINK', 'https://tailwindcss.com/docs', 3),
    (4, 2, 'Express Layered Architecture Principles', 'Separation of concerns between routes, controllers, and services.', 'TEXT', 'Architectural guideline: Keep controllers lean; business logic resides inside services.', 1),
    (5, 2, 'REST API Security & JWT Authentication PDF', 'Lecture slides on token verification, bcrypt hashing, and rate limiting.', 'PDF', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', 2),
    (6, 3, 'Relational Database Schema Design Primer', 'Understanding keys, constraints, and relational schemas.', 'PDF', 'https://www.postgresql.org/docs/current/ddl.html', 1),
    (7, 3, 'PostgreSQL Indexing Explained Video', 'Deep dive into B-Tree, GIN, and GiST indexes with query plans.', 'VIDEO', 'https://www.youtube.com/watch?v=clrtTYP_h1c', 2),
    (8, 4, 'Database Normalization Rules (1NF to BCNF)', 'Step-by-step breakdown of functional dependencies and normal forms.', 'TEXT', '1NF: Atomic values. 2NF: No partial key dependency. 3NF: No transitive dependency. BCNF: Every determinant is a candidate key.', 1),
    (9, 5, 'Linked Lists & Arrays Complexity Analysis', 'Big-O comparison of contiguous vs node-linked memory allocation.', 'PDF', 'https://en.wikipedia.org/wiki/Analysis_of_algorithms', 1),
    (10, 6, 'Binary Search Trees & Graph Traversals', 'Visual guide to BFS and DFS implementations.', 'LINK', 'https://visualgo.net/en/bst', 1)
  `);

  // Seed Enrollments
  await query(`
    INSERT INTO enrollments (id, student_id, course_id, status) VALUES
    (1, 4, 1, 'ENROLLED'),
    (2, 4, 2, 'ENROLLED'),
    (3, 5, 1, 'ENROLLED'),
    (4, 5, 3, 'ENROLLED'),
    (5, 6, 2, 'ENROLLED'),
    (6, 7, 1, 'ENROLLED'),
    (7, 8, 3, 'ENROLLED')
  `);

  // Seed Quizzes
  await query(`
    INSERT INTO quizzes (id, course_id, module_id, title, description, time_limit_minutes, total_marks, passing_marks, max_attempts) VALUES
    (1, 1, 1, 'Quiz 1: React Fundamentals & Hooks', 'Test your knowledge on React lifecycle, useState, and component architecture.', 15, 10.00, 6.00, 2),
    (2, 2, 3, 'Quiz 1: Relational Schema & Normalization', 'Assess understanding of primary keys, foreign keys, and 1NF to 3NF rules.', 20, 10.00, 6.00, 1),
    (3, 3, 5, 'Quiz 1: Data Structures Complexity Check', 'Quick MCQ assessment on asymptotic Big-O notations and stack/queue properties.', 10, 5.00, 3.00, 1)
  `);

  // Seed Questions
  await query(`
    INSERT INTO questions (id, quiz_id, question_text, marks, order_index) VALUES
    (1, 1, 'What is the primary role of the useEffect hook in React?', 2.50, 1),
    (2, 1, 'Which hook is used to maintain local mutable state across renders in a functional component?', 2.50, 2),
    (3, 1, 'What does JSX compile down to in modern React applications?', 2.50, 3),
    (4, 1, 'Why is a key prop required when rendering dynamic lists in React?', 2.50, 4),
    (5, 2, 'Which normal form guarantees the elimination of all transitive dependencies?', 3.00, 1),
    (6, 2, 'What constraint ensures referential integrity between two relational tables?', 3.00, 2),
    (7, 2, 'Which SQL clause is used to filter records after aggregation with GROUP BY?', 4.00, 3),
    (8, 3, 'What is the average time complexity of searching an element in an unsorted array?', 2.50, 1),
    (9, 3, 'Which data structure follows the Last-In, First-Out (LIFO) principle?', 2.50, 2)
  `);

  // Seed Options
  await query(`
    INSERT INTO options (id, question_id, option_text, is_correct, order_index) VALUES
    (1, 1, 'To perform side effects such as data fetching, subscriptions, or DOM mutations', 1, 1),
    (2, 1, 'To directly replace Redux or global context store', 0, 2),
    (3, 1, 'To prevent re-rendering of child components', 0, 3),
    (4, 1, 'To create HTML stylesheets dynamically', 0, 4),

    (5, 2, 'useReducer only', 0, 1),
    (6, 2, 'useState', 1, 2),
    (7, 2, 'useMemo', 0, 3),
    (8, 2, 'useContext', 0, 4),

    (9, 3, 'React.createElement calls or compiled JSX runtime functions', 1, 1),
    (10, 3, 'Direct innerHTML assignments in the DOM', 0, 2),
    (11, 3, 'Binary WebAssembly bytecode', 0, 3),
    (12, 3, 'Raw XML parse trees', 0, 4),

    (13, 4, 'To help React identify which items have changed, been added, or been removed', 1, 1),
    (14, 4, 'To apply CSS styling directly to list items', 0, 2),
    (15, 4, 'To encrypt DOM nodes for security', 0, 3),
    (16, 4, 'To bind click events automatically', 0, 4),

    (17, 5, 'First Normal Form (1NF)', 0, 1),
    (18, 5, 'Second Normal Form (2NF)', 0, 2),
    (19, 5, 'Third Normal Form (3NF)', 1, 3),
    (20, 5, 'Zero Normal Form (0NF)', 0, 4),

    (21, 6, 'CHECK constraint', 0, 1),
    (22, 6, 'FOREIGN KEY constraint', 1, 2),
    (23, 6, 'UNIQUE constraint', 0, 3),
    (24, 6, 'DEFAULT constraint', 0, 4),

    (25, 7, 'WHERE', 0, 1),
    (26, 7, 'ORDER BY', 0, 2),
    (27, 7, 'HAVING', 1, 3),
    (28, 7, 'LIMIT', 0, 4),

    (29, 8, 'O(1)', 0, 1),
    (30, 8, 'O(log n)', 0, 2),
    (31, 8, 'O(n)', 1, 3),
    (32, 8, 'O(n^2)', 0, 4),

    (33, 9, 'Queue', 0, 1),
    (34, 9, 'Stack', 1, 2),
    (35, 9, 'Array', 0, 3),
    (36, 9, 'Hash Table', 0, 4)
  `);

  // Seed Assignments
  await query(`
    INSERT INTO assignments (id, course_id, module_id, title, description, deadline, total_marks) VALUES
    (1, 1, 2, 'Build an Express REST API with Layered Architecture', 'Implement routes, controllers, and services for a book catalog with input validation and error handling.', datetime('now', '+14 days'), 100.00),
    (2, 2, 4, 'Design an E-Commerce Relational Schema & 3NF Proof', 'Create schema.sql with normalized tables and write a document explaining candidate keys and 3NF normalization.', datetime('now', '+7 days'), 100.00),
    (3, 3, 6, 'Implement BFS and DFS Graph Algorithms in JavaScript', 'Write clean functions to traverse an adjacency list graph and detect cycles.', datetime('now', '-2 days'), 50.00)
  `);

  // Seed Submissions
  await query(`
    INSERT INTO submissions (id, assignment_id, student_id, submission_type, content, state, grade, feedback, graded_by, graded_at) VALUES
    (1, 1, 4, 'LINK', 'https://github.com/alice-student/express-layered-api', 'SUBMITTED', NULL, NULL, NULL, NULL),
    (2, 2, 6, 'TEXT', 'Completed SQL script and 3NF decomposition for Users, Products, Orders, and OrderItems tables.', 'GRADED', 95.00, 'Excellent schema design, clear justification for 3NF.', 3, datetime('now', '-1 day'))
  `);

  // Seed Progress
  await query(`
    INSERT INTO material_progress (student_id, course_id, material_id, completed, completed_at) VALUES
    (4, 1, 1, 1, datetime('now', '-9 days')),
    (4, 1, 2, 1, datetime('now', '-7 days')),
    (4, 1, 3, 0, NULL),
    (5, 1, 1, 1, datetime('now', '-6 days')),
    (6, 2, 6, 1, datetime('now', '-4 days'))
  `);

  console.log('[Local DB SUCCESS] 13 normalized tables and demo data ready!');
}

if (require.main === module) {
  setupLocalTables()
    .then(() => {
      console.log('Setup finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = setupLocalTables;
