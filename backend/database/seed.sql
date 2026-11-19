-- ============================================================================
-- SkillBridge Database Seed Data
-- Demo dataset: 1 Admin, 2 Instructors, 5 Students, 3 Courses with Modules,
-- Materials, Quizzes, Questions, Options, Assignments, Enrollments & Progress
-- Default password for all demo accounts: Password123!
-- ============================================================================

-- Clean existing data
TRUNCATE users, courses, enrollments, modules, materials, material_progress,
         quizzes, questions, options, quiz_attempts, attempt_answers,
         assignments, submissions RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS
-- 1 Admin, 2 Instructors, 5 Students
-- Password for all: Password123! ($2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, status, bio) VALUES
-- Admin (id = 1)
(1, 'Admin User', 'admin@skillbridge.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'ADMIN', 'ACTIVE', 'System Administrator with overall management rights.'),

-- Instructors (ids = 2, 3)
(2, 'Dr. Robert Smith', 'dr.smith@skillbridge.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'INSTRUCTOR', 'ACTIVE', 'Professor of Software Engineering and Full-Stack Web Development.'),
(3, 'Prof. Ada Sharma', 'prof.ada@skillbridge.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'INSTRUCTOR', 'ACTIVE', 'Database Architect, SQL Specialist, and Systems Researcher.'),

-- Students (ids = 4, 5, 6, 7, 8)
(4, 'Alice Walker', 'alice@student.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'STUDENT', 'ACTIVE', 'Junior CS undergrad passionate about full-stack web development.'),
(5, 'Bob Miller', 'bob@student.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'STUDENT', 'ACTIVE', 'Software Engineering student interested in backend architectures.'),
(6, 'Charlie Davis', 'charlie@student.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'STUDENT', 'ACTIVE', 'Enthusiastic developer learning SQL databases and API design.'),
(7, 'Diana Prince', 'diana@student.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'STUDENT', 'ACTIVE', 'Frontend enthusiast building interactive UI systems.'),
(8, 'Evan Wright', 'evan@student.edu', '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO', 'STUDENT', 'ACTIVE', 'Undergraduate exploring data structures and algorithms.');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------------------------
-- 2. COURSES (3 Courses)
-- ----------------------------------------------------------------------------
INSERT INTO courses (id, title, description, category, level, instructor_id, status) VALUES
(1, 'Full-Stack Web Engineering with React & Node', 'Master modern web development from UI design to server-side REST APIs, middleware architectures, and database persistence.', 'Web Development', 'Intermediate', 2, 'PUBLISHED'),
(2, 'Relational Database Design & PostgreSQL Mastery', 'In-depth coverage of 1NF to BCNF normalization, relational algebra, SQL optimization, transactions, and indexing.', 'Databases', 'Beginner', 3, 'PUBLISHED'),
(3, 'Data Structures & Algorithms in JavaScript', 'Practical understanding of arrays, linked lists, hash tables, trees, graphs, sorting, and algorithmic complexity.', 'Computer Science', 'Intermediate', 2, 'PUBLISHED');

SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- ----------------------------------------------------------------------------
-- 3. MODULES
-- ----------------------------------------------------------------------------
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
-- Course 1 Modules
(1, 1, 'Module 1: Architecture & Frontend Foundations', 'Component design, Vite tooling, and state management in React.', 1),
(2, 1, 'Module 2: Layered REST APIs with Express', 'Routes, controllers, services, middleware, and error handling.', 2),

-- Course 2 Modules
(3, 2, 'Module 1: Database Fundamentals & Entity Modeling', 'Relational models, ER diagrams, primary keys, and foreign keys.', 1),
(4, 2, 'Module 2: Normalization & Complex SQL Queries', 'Eliminating redundancy with 1NF, 2NF, 3NF, BCNF, and joins.', 2),

-- Course 3 Modules
(5, 3, 'Module 1: Linear Data Structures', 'Stacks, Queues, Linked Lists and time-complexity trade-offs.', 1),
(6, 3, 'Module 2: Trees, Graphs & Algorithms', 'Binary search trees, traversals, and dynamic programming.', 2);

SELECT setval('modules_id_seq', (SELECT MAX(id) FROM modules));

-- ----------------------------------------------------------------------------
-- 4. MATERIALS
-- ----------------------------------------------------------------------------
INSERT INTO materials (id, module_id, title, description, content_type, url_or_path, order_index) VALUES
-- Course 1 - Module 1
(1, 1, 'React Component Lifecycle & Hooks Guide', 'Comprehensive guide to useState, useEffect, and custom hooks.', 'PDF', 'https://react.dev/reference/react', 1),
(2, 1, 'Building Reactive Interfaces Video Lecture', 'Video walkthrough of modern React 18 component composition.', 'VIDEO', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 2),
(3, 1, 'Tailwind CSS Quick Reference', 'Core utility classes, grid systems, and responsive design patterns.', 'LINK', 'https://tailwindcss.com/docs', 3),

-- Course 1 - Module 2
(4, 2, 'Express Layered Architecture Principles', 'Separation of concerns between routes, controllers, and services.', 'TEXT', 'Architectural guideline: Keep controllers lean; business logic resides inside services.', 1),
(5, 2, 'REST API Security & JWT Authentication PDF', 'Lecture slides on token verification, bcrypt hashing, and rate limiting.', 'PDF', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', 2),

-- Course 2 - Module 1
(6, 3, 'Relational Database Schema Design Primer', 'Understanding keys, constraints, and relational schemas.', 'PDF', 'https://www.postgresql.org/docs/current/ddl.html', 1),
(7, 3, 'PostgreSQL Indexing Explained Video', 'Deep dive into B-Tree, GIN, and GiST indexes with query plans.', 'VIDEO', 'https://www.youtube.com/watch?v=clrtTYP_h1c', 2),

-- Course 2 - Module 2
(8, 4, 'Database Normalization Rules (1NF to BCNF)', 'Step-by-step breakdown of functional dependencies and normal forms.', 'TEXT', '1NF: Atomic values. 2NF: No partial key dependency. 3NF: No transitive dependency. BCNF: Every determinant is a candidate key.', 1),

-- Course 3 - Module 1
(9, 5, 'Linked Lists & Arrays Complexity Analysis', 'Big-O comparison of contiguous vs node-linked memory allocation.', 'PDF', 'https://en.wikipedia.org/wiki/Analysis_of_algorithms', 1),
(10, 6, 'Binary Search Trees & Graph Traversals', 'Visual guide to BFS and DFS implementations.', 'LINK', 'https://visualgo.net/en/bst', 1);

SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));

-- ----------------------------------------------------------------------------
-- 5. ENROLLMENTS
-- ----------------------------------------------------------------------------
INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at) VALUES
(1, 4, 1, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '10 days'), -- Alice in Course 1
(2, 4, 2, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '8 days'),  -- Alice in Course 2
(3, 5, 1, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '7 days'),  -- Bob in Course 1
(4, 5, 3, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '6 days'),  -- Bob in Course 3
(5, 6, 2, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '5 days'),  -- Charlie in Course 2
(6, 7, 1, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '4 days'),  -- Diana in Course 1
(7, 8, 3, 'ENROLLED', CURRENT_TIMESTAMP - INTERVAL '3 days');  -- Evan in Course 3

SELECT setval('enrollments_id_seq', (SELECT MAX(id) FROM enrollments));

-- ----------------------------------------------------------------------------
-- 6. MATERIAL PROGRESS (Sample student completion)
-- ----------------------------------------------------------------------------
INSERT INTO material_progress (student_id, course_id, material_id, completed, completed_at) VALUES
(4, 1, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '9 days'),
(4, 1, 2, TRUE, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(4, 1, 3, FALSE, NULL),
(5, 1, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 2, 6, TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days');

-- ----------------------------------------------------------------------------
-- 7. QUIZZES
-- ----------------------------------------------------------------------------
INSERT INTO quizzes (id, course_id, module_id, title, description, time_limit_minutes, total_marks, passing_marks, max_attempts) VALUES
(1, 1, 1, 'Quiz 1: React Fundamentals & Hooks', 'Test your knowledge on React lifecycle, useState, and component architecture.', 15, 10.00, 6.00, 2),
(2, 2, 3, 'Quiz 1: Relational Schema & Normalization', 'Assess understanding of primary keys, foreign keys, and 1NF to 3NF rules.', 20, 10.00, 6.00, 1),
(3, 3, 5, 'Quiz 1: Data Structures Complexity Check', 'Quick MCQ assessment on asymptotic Big-O notations and stack/queue properties.', 10, 5.00, 3.00, 1);

SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes));

-- ----------------------------------------------------------------------------
-- 8. QUESTIONS
-- ----------------------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, marks, order_index) VALUES
-- Quiz 1 Questions (Course 1)
(1, 1, 'What is the primary role of the useEffect hook in React?', 2.50, 1),
(2, 1, 'Which hook is used to maintain local mutable state across renders in a functional component?', 2.50, 2),
(3, 1, 'What does JSX compile down to in modern React applications?', 2.50, 3),
(4, 1, 'Why is a key prop required when rendering dynamic lists in React?', 2.50, 4),

-- Quiz 2 Questions (Course 2)
(5, 2, 'Which normal form guarantees the elimination of all transitive dependencies?', 3.00, 1),
(6, 2, 'What constraint ensures referential integrity between two relational tables?', 3.00, 2),
(7, 2, 'Which SQL clause is used to filter records after aggregation with GROUP BY?', 4.00, 3),

-- Quiz 3 Questions (Course 3)
(8, 3, 'What is the average time complexity of searching an element in an unsorted array?', 2.50, 1),
(9, 3, 'Which data structure follows the Last-In, First-Out (LIFO) principle?', 2.50, 2);

SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));

-- ----------------------------------------------------------------------------
-- 9. OPTIONS
-- ----------------------------------------------------------------------------
INSERT INTO options (id, question_id, option_text, is_correct, order_index) VALUES
-- Question 1 Options
(1, 1, 'To perform side effects such as data fetching, subscriptions, or DOM mutations', TRUE, 1),
(2, 1, 'To directly replace Redux or global context store', FALSE, 2),
(3, 1, 'To prevent re-rendering of child components', FALSE, 3),
(4, 1, 'To create HTML stylesheets dynamically', FALSE, 4),

-- Question 2 Options
(5, 2, 'useReducer only', FALSE, 1),
(6, 2, 'useState', TRUE, 2),
(7, 2, 'useMemo', FALSE, 3),
(8, 2, 'useContext', FALSE, 4),

-- Question 3 Options
(9, 3, 'React.createElement calls or compiled JSX runtime functions', TRUE, 1),
(10, 3, 'Direct innerHTML assignments in the DOM', FALSE, 2),
(11, 3, 'Binary WebAssembly bytecode', FALSE, 3),
(12, 3, 'Raw XML parse trees', FALSE, 4),

-- Question 4 Options
(13, 4, 'To help React identify which items have changed, been added, or been removed', TRUE, 1),
(14, 4, 'To apply CSS styling directly to list items', FALSE, 2),
(15, 4, 'To encrypt DOM nodes for security', FALSE, 3),
(16, 4, 'To bind click events automatically', FALSE, 4),

-- Question 5 Options (Quiz 2)
(17, 5, 'First Normal Form (1NF)', FALSE, 1),
(18, 5, 'Second Normal Form (2NF)', FALSE, 2),
(19, 5, 'Third Normal Form (3NF)', TRUE, 3),
(20, 5, 'Zero Normal Form (0NF)', FALSE, 4),

-- Question 6 Options (Quiz 2)
(21, 6, 'CHECK constraint', FALSE, 1),
(22, 6, 'FOREIGN KEY constraint', TRUE, 2),
(23, 6, 'UNIQUE constraint', FALSE, 3),
(24, 6, 'DEFAULT constraint', FALSE, 4),

-- Question 7 Options (Quiz 2)
(25, 7, 'WHERE', FALSE, 1),
(26, 7, 'ORDER BY', FALSE, 2),
(27, 7, 'HAVING', TRUE, 3),
(28, 7, 'LIMIT', FALSE, 4),

-- Question 8 Options (Quiz 3)
(29, 8, 'O(1)', FALSE, 1),
(30, 8, 'O(log n)', FALSE, 2),
(31, 8, 'O(n)', TRUE, 3),
(32, 8, 'O(n^2)', FALSE, 4),

-- Question 9 Options (Quiz 3)
(33, 9, 'Queue', FALSE, 1),
(34, 9, 'Stack', TRUE, 2),
(35, 9, 'Array', FALSE, 3),
(36, 9, 'Hash Table', FALSE, 4);

SELECT setval('options_id_seq', (SELECT MAX(id) FROM options));

-- ----------------------------------------------------------------------------
-- 10. QUIZ ATTEMPTS & ANSWERS (Demo student attempt)
-- ----------------------------------------------------------------------------
INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, start_time, submit_time, score, state) VALUES
(1, 1, 4, 1, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '10 minutes', 10.00, 'EVALUATED');

SELECT setval('quiz_attempts_id_seq', (SELECT MAX(id) FROM quiz_attempts));

INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id, is_correct, marks_awarded) VALUES
(1, 1, 1, TRUE, 2.50),
(1, 2, 6, TRUE, 2.50),
(1, 3, 9, TRUE, 2.50),
(1, 4, 13, TRUE, 2.50);

-- ----------------------------------------------------------------------------
-- 11. ASSIGNMENTS
-- ----------------------------------------------------------------------------
INSERT INTO assignments (id, course_id, module_id, title, description, deadline, total_marks) VALUES
(1, 1, 2, 'Build an Express REST API with Layered Architecture', 'Implement routes, controllers, and services for a book catalog with input validation and error handling.', CURRENT_TIMESTAMP + INTERVAL '14 days', 100.00),
(2, 2, 4, 'Design an E-Commerce Relational Schema & 3NF Proof', 'Create schema.sql with normalized tables and write a document explaining candidate keys and 3NF normalization.', CURRENT_TIMESTAMP + INTERVAL '7 days', 100.00),
(3, 3, 6, 'Implement BFS and DFS Graph Algorithms in JavaScript', 'Write clean functions to traverse an adjacency list graph and detect cycles.', CURRENT_TIMESTAMP - INTERVAL '2 days', 50.00);

SELECT setval('assignments_id_seq', (SELECT MAX(id) FROM assignments));

-- ----------------------------------------------------------------------------
-- 12. SUBMISSIONS (Sample student submissions)
-- ----------------------------------------------------------------------------
INSERT INTO submissions (id, assignment_id, student_id, submission_type, content, submitted_at, state, grade, feedback, graded_by, graded_at) VALUES
(1, 1, 4, 'LINK', 'https://github.com/alice-student/express-layered-api', CURRENT_TIMESTAMP - INTERVAL '1 day', 'SUBMITTED', NULL, NULL, NULL, NULL),
(2, 2, 6, 'TEXT', 'Completed SQL script and 3NF decomposition for Users, Products, Orders, and OrderItems tables.', CURRENT_TIMESTAMP - INTERVAL '3 days', 'GRADED', 95.00, 'Excellent schema design, clear justification for 3NF.', 3, CURRENT_TIMESTAMP - INTERVAL '1 day');

SELECT setval('submissions_id_seq', (SELECT MAX(id) FROM submissions));
