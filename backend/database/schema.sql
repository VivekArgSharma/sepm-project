-- ============================================================================
-- SkillBridge Database Schema
-- Online Skill-Based Learning & Course Management System
-- Normalized Relational Schema for PostgreSQL
-- ============================================================================

-- Clean up existing tables in reverse dependency order
DROP TABLE IF EXISTS attempt_answers CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS material_progress CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Roles: STUDENT, INSTRUCTOR, ADMIN
-- Status: ACTIVE, PENDING (for instructor approval), DEACTIVATED
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'DEACTIVATED')),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. COURSES TABLE
-- Status: DRAFT, PUBLISHED, ARCHIVED
-- Level: Beginner, Intermediate, Advanced
-- ----------------------------------------------------------------------------
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    thumbnail_url TEXT,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);

-- ----------------------------------------------------------------------------
-- 3. ENROLLMENTS TABLE
-- Tracks student course registration
-- ----------------------------------------------------------------------------
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'DROPPED', 'COMPLETED')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_course UNIQUE (student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ----------------------------------------------------------------------------
-- 4. MODULES TABLE
-- Course sections/chapters
-- ----------------------------------------------------------------------------
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_course ON modules(course_id);

-- ----------------------------------------------------------------------------
-- 5. MATERIALS TABLE
-- Lessons/resources inside modules (video/PDF link, text)
-- Content Types: VIDEO, PDF, LINK, TEXT
-- ----------------------------------------------------------------------------
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('VIDEO', 'PDF', 'LINK', 'TEXT')),
    url_or_path TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_module ON materials(module_id);

-- ----------------------------------------------------------------------------
-- 6. MATERIAL_PROGRESS TABLE
-- Per-student completion tracking per lesson/material
-- ----------------------------------------------------------------------------
CREATE TABLE material_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_student_material UNIQUE (student_id, material_id)
);

CREATE INDEX idx_progress_student_course ON material_progress(student_id, course_id);
CREATE INDEX idx_progress_material ON material_progress(material_id);

-- ----------------------------------------------------------------------------
-- 7. QUIZZES TABLE
-- MCQ assessments with time limit and passing criteria
-- ----------------------------------------------------------------------------
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER NOT NULL DEFAULT 15 CHECK (time_limit_minutes > 0),
    total_marks NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    passing_marks NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_module ON quizzes(module_id);

-- ----------------------------------------------------------------------------
-- 8. QUESTIONS TABLE
-- MCQ questions inside a quiz
-- ----------------------------------------------------------------------------
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    marks NUMERIC(5, 2) NOT NULL DEFAULT 1.00 CHECK (marks > 0),
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);

-- ----------------------------------------------------------------------------
-- 9. OPTIONS TABLE
-- Choices for each MCQ question
-- ----------------------------------------------------------------------------
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_options_question ON options(question_id);

-- ----------------------------------------------------------------------------
-- 10. QUIZ_ATTEMPTS TABLE
-- States: NOT_STARTED, IN_PROGRESS, SUBMITTED, EVALUATED
-- ----------------------------------------------------------------------------
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submit_time TIMESTAMP WITH TIME ZONE,
    score NUMERIC(5, 2) DEFAULT 0.00,
    state VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (state IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_quiz_student_attempt UNIQUE (quiz_id, student_id, attempt_number)
);

CREATE INDEX idx_attempts_quiz_student ON quiz_attempts(quiz_id, student_id);
CREATE INDEX idx_attempts_state ON quiz_attempts(state);

-- ----------------------------------------------------------------------------
-- 11. ATTEMPT_ANSWERS TABLE
-- Individual question answers submitted during a quiz attempt
-- ----------------------------------------------------------------------------
CREATE TABLE attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    marks_awarded NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_attempt_answers_attempt ON attempt_answers(attempt_id);

-- ----------------------------------------------------------------------------
-- 12. ASSIGNMENTS TABLE
-- Tasks with deadlines and total marks
-- ----------------------------------------------------------------------------
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    total_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_deadline ON assignments(deadline);

-- ----------------------------------------------------------------------------
-- 13. SUBMISSIONS TABLE
-- States: PENDING, SUBMITTED, LATE, GRADED
-- Submission Types: TEXT, LINK, FILE
-- ----------------------------------------------------------------------------
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (submission_type IN ('TEXT', 'LINK', 'FILE')),
    content TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    state VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (state IN ('PENDING', 'SUBMITTED', 'LATE', 'GRADED')),
    grade NUMERIC(5, 2),
    feedback TEXT,
    graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_state ON submissions(state);
