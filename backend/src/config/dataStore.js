/**
 * Local Data Store (Pure JavaScript Persistence Engine)
 * Provides 100% local, zero-setup relational data persistence for development & evaluation.
 * Persists data to backend/database/local_store.json on writes.
 * If PostgreSQL is configured, queries route to PostgreSQL instead.
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../database/local_store.json');
const demoPasswordHash = '$2a$10$hMexzmQgz/.Q595caz3WNOr9gjmK1L6NjXDt0GZHAKon7G6JhpmoO'; // Password123!

const getInitialData = () => ({
  users: [
    { id: 1, name: 'Admin User', email: 'admin@skillbridge.edu', password_hash: demoPasswordHash, role: 'ADMIN', status: 'ACTIVE', bio: 'System Administrator with overall management rights.', created_at: new Date().toISOString() },
    { id: 2, name: 'Dr. Robert Smith', email: 'dr.smith@skillbridge.edu', password_hash: demoPasswordHash, role: 'INSTRUCTOR', status: 'ACTIVE', bio: 'Professor of Software Engineering and Full-Stack Web Development.', created_at: new Date().toISOString() },
    { id: 3, name: 'Prof. Ada Sharma', email: 'prof.ada@skillbridge.edu', password_hash: demoPasswordHash, role: 'INSTRUCTOR', status: 'ACTIVE', bio: 'Database Architect, SQL Specialist, and Systems Researcher.', created_at: new Date().toISOString() },
    { id: 4, name: 'Alice Walker', email: 'alice@student.edu', password_hash: demoPasswordHash, role: 'STUDENT', status: 'ACTIVE', bio: 'Junior CS undergrad passionate about full-stack web development.', created_at: new Date().toISOString() },
    { id: 5, name: 'Bob Miller', email: 'bob@student.edu', password_hash: demoPasswordHash, role: 'STUDENT', status: 'ACTIVE', bio: 'Software Engineering student interested in backend architectures.', created_at: new Date().toISOString() },
    { id: 6, name: 'Charlie Davis', email: 'charlie@student.edu', password_hash: demoPasswordHash, role: 'STUDENT', status: 'ACTIVE', bio: 'Enthusiastic developer learning SQL databases and API design.', created_at: new Date().toISOString() },
    { id: 7, name: 'Diana Prince', email: 'diana@student.edu', password_hash: demoPasswordHash, role: 'STUDENT', status: 'ACTIVE', bio: 'Frontend enthusiast building interactive UI systems.', created_at: new Date().toISOString() },
    { id: 8, name: 'Evan Wright', email: 'evan@student.edu', password_hash: demoPasswordHash, role: 'STUDENT', status: 'ACTIVE', bio: 'Undergraduate exploring data structures and algorithms.', created_at: new Date().toISOString() },
  ],
  courses: [
    { id: 1, title: 'Full-Stack Web Engineering with React & Node', description: 'Master modern web development from UI design to server-side REST APIs, middleware architectures, and database persistence.', category: 'Web Development', level: 'Intermediate', instructor_id: 2, status: 'PUBLISHED', created_at: new Date().toISOString() },
    { id: 2, title: 'Relational Database Design & PostgreSQL Mastery', description: 'In-depth coverage of 1NF to BCNF normalization, relational algebra, SQL optimization, transactions, and indexing.', category: 'Databases', level: 'Beginner', instructor_id: 3, status: 'PUBLISHED', created_at: new Date().toISOString() },
    { id: 3, title: 'Data Structures & Algorithms in JavaScript', description: 'Practical understanding of arrays, linked lists, hash tables, trees, graphs, sorting, and algorithmic complexity.', category: 'Computer Science', level: 'Intermediate', instructor_id: 2, status: 'PUBLISHED', created_at: new Date().toISOString() },
  ],
  enrollments: [
    { id: 1, student_id: 4, course_id: 1, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 864000000).toISOString() },
    { id: 2, student_id: 4, course_id: 2, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 691200000).toISOString() },
    { id: 3, student_id: 5, course_id: 1, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 604800000).toISOString() },
    { id: 4, student_id: 5, course_id: 3, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 518400000).toISOString() },
    { id: 5, student_id: 6, course_id: 2, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 432000000).toISOString() },
    { id: 6, student_id: 7, course_id: 1, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 345600000).toISOString() },
    { id: 7, student_id: 8, course_id: 3, status: 'ENROLLED', enrolled_at: new Date(Date.now() - 259200000).toISOString() },
  ],
  modules: [
    { id: 1, course_id: 1, title: 'Module 1: Architecture & Frontend Foundations', description: 'Component design, Vite tooling, and state management in React.', order_index: 1, created_at: new Date().toISOString() },
    { id: 2, course_id: 1, title: 'Module 2: Layered REST APIs with Express', description: 'Routes, controllers, services, middleware, and error handling.', order_index: 2, created_at: new Date().toISOString() },
    { id: 3, course_id: 2, title: 'Module 1: Database Fundamentals & Entity Modeling', description: 'Relational models, ER diagrams, primary keys, and foreign keys.', order_index: 1, created_at: new Date().toISOString() },
    { id: 4, course_id: 2, title: 'Module 2: Normalization & Complex SQL Queries', description: 'Eliminating redundancy with 1NF, 2NF, 3NF, BCNF, and joins.', order_index: 2, created_at: new Date().toISOString() },
    { id: 5, course_id: 3, title: 'Module 1: Linear Data Structures', description: 'Stacks, Queues, Linked Lists and time-complexity trade-offs.', order_index: 1, created_at: new Date().toISOString() },
    { id: 6, course_id: 3, title: 'Module 2: Trees, Graphs & Algorithms', description: 'Binary search trees, traversals, and dynamic programming.', order_index: 2, created_at: new Date().toISOString() },
  ],
  materials: [
    { id: 1, module_id: 1, title: 'React Component Lifecycle & Hooks Guide', description: 'Comprehensive guide to useState, useEffect, and custom hooks.', content_type: 'PDF', url_or_path: 'https://react.dev/reference/react', order_index: 1 },
    { id: 2, module_id: 1, title: 'Building Reactive Interfaces Video Lecture', description: 'Video walkthrough of modern React 18 component composition.', content_type: 'VIDEO', url_or_path: 'https://www.youtube.com/watch?v=bMknfKXIFA8', order_index: 2 },
    { id: 3, module_id: 1, title: 'Tailwind CSS Quick Reference', description: 'Core utility classes, grid systems, and responsive design patterns.', content_type: 'LINK', url_or_path: 'https://tailwindcss.com/docs', order_index: 3 },
    { id: 4, module_id: 2, title: 'Express Layered Architecture Principles', description: 'Separation of concerns between routes, controllers, and services.', content_type: 'TEXT', url_or_path: 'Keep controllers lean; business logic resides inside services.', order_index: 1 },
    { id: 5, module_id: 2, title: 'REST API Security & JWT Authentication PDF', description: 'Lecture slides on token verification, bcrypt hashing, and rate limiting.', content_type: 'PDF', url_or_path: 'https://cheatsheetseries.owasp.org/', order_index: 2 },
    { id: 6, module_id: 3, title: 'Relational Database Schema Design Primer', description: 'Understanding keys, constraints, and relational schemas.', content_type: 'PDF', url_or_path: 'https://www.postgresql.org/docs/current/ddl.html', order_index: 1 },
    { id: 7, module_id: 3, title: 'PostgreSQL Indexing Explained Video', description: 'Deep dive into B-Tree, GIN, and GiST indexes with query plans.', content_type: 'VIDEO', url_or_path: 'https://www.youtube.com/watch?v=clrtTYP_h1c', order_index: 2 },
    { id: 8, module_id: 4, title: 'Database Normalization Rules (1NF to BCNF)', description: 'Step-by-step breakdown of functional dependencies and normal forms.', content_type: 'TEXT', url_or_path: '1NF: Atomic values. 2NF: No partial key dependency. 3NF: No transitive dependency. BCNF: Determinant is candidate key.', order_index: 1 },
    { id: 9, module_id: 5, title: 'Linked Lists & Arrays Complexity Analysis', description: 'Big-O comparison of contiguous vs node-linked memory allocation.', content_type: 'PDF', url_or_path: 'https://en.wikipedia.org/wiki/Analysis_of_algorithms', order_index: 1 },
    { id: 10, module_id: 6, title: 'Binary Search Trees & Graph Traversals', description: 'Visual guide to BFS and DFS implementations.', content_type: 'LINK', url_or_path: 'https://visualgo.net/en/bst', order_index: 1 },
  ],
  material_progress: [
    { id: 1, student_id: 4, course_id: 1, material_id: 1, completed: true, completed_at: new Date(Date.now() - 777600000).toISOString() },
    { id: 2, student_id: 4, course_id: 1, material_id: 2, completed: true, completed_at: new Date(Date.now() - 604800000).toISOString() },
    { id: 3, student_id: 4, course_id: 1, material_id: 3, completed: false, completed_at: null },
    { id: 4, student_id: 5, course_id: 1, material_id: 1, completed: true, completed_at: new Date(Date.now() - 518400000).toISOString() },
    { id: 5, student_id: 6, course_id: 2, material_id: 6, completed: true, completed_at: new Date(Date.now() - 345600000).toISOString() },
  ],
  quizzes: [
    { id: 1, course_id: 1, module_id: 1, title: 'Quiz 1: React Fundamentals & Hooks', description: 'Test your knowledge on React lifecycle, useState, and component architecture.', time_limit_minutes: 15, total_marks: 10, passing_marks: 6, max_attempts: 2, created_at: new Date().toISOString() },
    { id: 2, course_id: 2, module_id: 3, title: 'Quiz 1: Relational Schema & Normalization', description: 'Assess understanding of primary keys, foreign keys, and 1NF to 3NF rules.', time_limit_minutes: 20, total_marks: 10, passing_marks: 6, max_attempts: 1, created_at: new Date().toISOString() },
    { id: 3, course_id: 3, module_id: 5, title: 'Quiz 1: Data Structures Complexity Check', description: 'Quick MCQ assessment on asymptotic Big-O notations and stack/queue properties.', time_limit_minutes: 10, total_marks: 5, passing_marks: 3, max_attempts: 1, created_at: new Date().toISOString() },
  ],
  questions: [
    { id: 1, quiz_id: 1, question_text: 'What is the primary role of the useEffect hook in React?', marks: 2.5, order_index: 1 },
    { id: 2, quiz_id: 1, question_text: 'Which hook is used to maintain local mutable state across renders in a functional component?', marks: 2.5, order_index: 2 },
    { id: 3, quiz_id: 1, question_text: 'What does JSX compile down to in modern React applications?', marks: 2.5, order_index: 3 },
    { id: 4, quiz_id: 1, question_text: 'Why is a key prop required when rendering dynamic lists in React?', marks: 2.5, order_index: 4 },
    { id: 5, quiz_id: 2, question_text: 'Which normal form guarantees the elimination of all transitive dependencies?', marks: 3.0, order_index: 1 },
    { id: 6, quiz_id: 2, question_text: 'What constraint ensures referential integrity between two relational tables?', marks: 3.0, order_index: 2 },
    { id: 7, quiz_id: 2, question_text: 'Which SQL clause is used to filter records after aggregation with GROUP BY?', marks: 4.0, order_index: 3 },
    { id: 8, quiz_id: 3, question_text: 'What is the average time complexity of searching an element in an unsorted array?', marks: 2.5, order_index: 1 },
    { id: 9, quiz_id: 3, question_text: 'Which data structure follows the Last-In, First-Out (LIFO) principle?', marks: 2.5, order_index: 2 },
  ],
  options: [
    { id: 1, question_id: 1, option_text: 'To perform side effects such as data fetching, subscriptions, or DOM mutations', is_correct: true, order_index: 1 },
    { id: 2, question_id: 1, option_text: 'To directly replace Redux or global context store', is_correct: false, order_index: 2 },
    { id: 3, question_id: 1, option_text: 'To prevent re-rendering of child components', is_correct: false, order_index: 3 },
    { id: 4, question_id: 1, option_text: 'To create HTML stylesheets dynamically', is_correct: false, order_index: 4 },

    { id: 5, question_id: 2, option_text: 'useReducer only', is_correct: false, order_index: 1 },
    { id: 6, question_id: 2, option_text: 'useState', is_correct: true, order_index: 2 },
    { id: 7, question_id: 2, option_text: 'useMemo', is_correct: false, order_index: 3 },
    { id: 8, question_id: 2, option_text: 'useContext', is_correct: false, order_index: 4 },

    { id: 9, question_id: 3, option_text: 'React.createElement calls or compiled JSX runtime functions', is_correct: true, order_index: 1 },
    { id: 10, question_id: 3, option_text: 'Direct innerHTML assignments in the DOM', is_correct: false, order_index: 2 },
    { id: 11, question_id: 3, option_text: 'Binary WebAssembly bytecode', is_correct: false, order_index: 3 },
    { id: 12, question_id: 3, option_text: 'Raw XML parse trees', is_correct: false, order_index: 4 },

    { id: 13, question_id: 4, option_text: 'To help React identify which items have changed, been added, or been removed', is_correct: true, order_index: 1 },
    { id: 14, question_id: 4, option_text: 'To apply CSS styling directly to list items', is_correct: false, order_index: 2 },
    { id: 15, question_id: 4, option_text: 'To encrypt DOM nodes for security', is_correct: false, order_index: 3 },
    { id: 16, question_id: 4, option_text: 'To bind click events automatically', is_correct: false, order_index: 4 },

    { id: 17, question_id: 5, option_text: 'First Normal Form (1NF)', is_correct: false, order_index: 1 },
    { id: 18, question_id: 5, option_text: 'Second Normal Form (2NF)', is_correct: false, order_index: 2 },
    { id: 19, question_id: 5, option_text: 'Third Normal Form (3NF)', is_correct: true, order_index: 3 },
    { id: 20, question_id: 5, option_text: 'Zero Normal Form (0NF)', is_correct: false, order_index: 4 },

    { id: 21, question_id: 6, option_text: 'CHECK constraint', is_correct: false, order_index: 1 },
    { id: 22, question_id: 6, option_text: 'FOREIGN KEY constraint', is_correct: true, order_index: 2 },
    { id: 23, question_id: 6, option_text: 'UNIQUE constraint', is_correct: false, order_index: 3 },
    { id: 24, question_id: 6, option_text: 'DEFAULT constraint', is_correct: false, order_index: 4 },

    { id: 25, question_id: 7, option_text: 'WHERE', is_correct: false, order_index: 1 },
    { id: 26, question_id: 7, option_text: 'ORDER BY', is_correct: false, order_index: 2 },
    { id: 27, question_id: 7, option_text: 'HAVING', is_correct: true, order_index: 3 },
    { id: 28, question_id: 7, option_text: 'LIMIT', is_correct: false, order_index: 4 },

    { id: 29, question_id: 8, option_text: 'O(1)', is_correct: false, order_index: 1 },
    { id: 30, question_id: 8, option_text: 'O(log n)', is_correct: false, order_index: 2 },
    { id: 31, question_id: 8, option_text: 'O(n)', is_correct: true, order_index: 3 },
    { id: 32, question_id: 8, option_text: 'O(n^2)', is_correct: false, order_index: 4 },

    { id: 33, question_id: 9, option_text: 'Queue', is_correct: false, order_index: 1 },
    { id: 34, question_id: 9, option_text: 'Stack', is_correct: true, order_index: 2 },
    { id: 35, question_id: 9, option_text: 'Array', is_correct: false, order_index: 3 },
    { id: 36, question_id: 9, option_text: 'Hash Table', is_correct: false, order_index: 4 },
  ],
  quiz_attempts: [
    { id: 1, quiz_id: 1, student_id: 4, attempt_number: 1, start_time: new Date(Date.now() - 172800000).toISOString(), submit_time: new Date(Date.now() - 172200000).toISOString(), score: 10.0, state: 'EVALUATED' },
  ],
  attempt_answers: [
    { id: 1, attempt_id: 1, question_id: 1, selected_option_id: 1, is_correct: true, marks_awarded: 2.5 },
    { id: 2, attempt_id: 1, question_id: 2, selected_option_id: 6, is_correct: true, marks_awarded: 2.5 },
    { id: 3, attempt_id: 1, question_id: 3, selected_option_id: 9, is_correct: true, marks_awarded: 2.5 },
    { id: 4, attempt_id: 1, question_id: 4, selected_option_id: 13, is_correct: true, marks_awarded: 2.5 },
  ],
  assignments: [
    { id: 1, course_id: 1, module_id: 2, title: 'Build an Express REST API with Layered Architecture', description: 'Implement routes, controllers, and services for a book catalog with input validation and error handling.', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), total_marks: 100 },
    { id: 2, course_id: 2, module_id: 4, title: 'Design an E-Commerce Relational Schema & 3NF Proof', description: 'Create schema.sql with normalized tables and write a document explaining candidate keys and 3NF normalization.', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), total_marks: 100 },
    { id: 3, course_id: 3, module_id: 6, title: 'Implement BFS and DFS Graph Algorithms in JavaScript', description: 'Write clean functions to traverse an adjacency list graph and detect cycles.', deadline: new Date(Date.now() - 2 * 86400000).toISOString(), total_marks: 50 },
  ],
  submissions: [
    { id: 1, assignment_id: 1, student_id: 4, submission_type: 'LINK', content: 'https://github.com/alice-student/express-layered-api', submitted_at: new Date(Date.now() - 86400000).toISOString(), state: 'SUBMITTED', grade: null, feedback: null, graded_by: null, graded_at: null },
    { id: 2, assignment_id: 2, student_id: 6, submission_type: 'TEXT', content: 'Completed SQL script and 3NF decomposition for Users, Products, Orders, and OrderItems tables.', submitted_at: new Date(Date.now() - 259200000).toISOString(), state: 'GRADED', grade: 95.0, feedback: 'Excellent schema design, clear justification for 3NF.', graded_by: 3, graded_at: new Date(Date.now() - 86400000).toISOString() },
  ]
});

class DataStore {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    const dbDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      try {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.warn('[DataStore] Corrupted local store, regenerating initial seed:', err.message);
      }
    }

    this.data = getInitialData();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore Save Error]', err.message);
    }
  }

  getTable(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  nextId(tableName) {
    const table = this.getTable(tableName);
    if (table.length === 0) return 1;
    return Math.max(...table.map((row) => Number(row.id) || 0)) + 1;
  }

  insert(tableName, row) {
    const table = this.getTable(tableName);
    const newRow = {
      id: row.id || this.nextId(tableName),
      ...row,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    table.push(newRow);
    this.save();
    return newRow;
  }

  update(tableName, id, updates) {
    const table = this.getTable(tableName);
    const idx = table.findIndex((r) => Number(r.id) === Number(id));
    if (idx === -1) return null;
    table[idx] = { ...table[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return table[idx];
  }

  delete(tableName, id) {
    const table = this.getTable(tableName);
    const idx = table.findIndex((r) => Number(r.id) === Number(id));
    if (idx === -1) return false;
    table.splice(idx, 1);
    this.save();
    return true;
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
