Build a complete full-stack web app for a college Software Engineering project.

PROJECT
Online Skill-Based Learning & Course Management System. It manages courses, learning materials, quizzes, assignments and student progress.

USERS AND ROLES
- Student: browse and register for courses, view materials, take quizzes, submit assignments, see own progress.
- Instructor: create and edit courses, upload materials (links or files), create quizzes, create assignments, grade submissions, see student progress for own courses.
- Admin: manage users and courses, approve instructors, view system-wide reports.

TECH STACK
- Frontend: React (Vite) + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express (REST API, layered: routes, controllers, services)
- Database: PostgreSQL
- Auth: JWT with bcrypt password hashing, role-based access control
- Validation: Zod or express-validator
- Testing: Jest + Supertest for the backend
- Everything configured through a .env file (provide .env.example only, never real secrets)

FEATURES
1. Auth: register, login, logout, role-based dashboards.
2. Courses: CRUD for instructors/admin, course catalogue with search and filter, student registration and un-registration.
3. Materials: instructors add lessons (title, description, video/PDF link), organised by course module.
4. Quizzes: instructors create quizzes with MCQ questions, a time limit and marks. Students take them with a countdown timer. Auto-evaluate answers and store scores. Quiz attempt states: NOT_STARTED, IN_PROGRESS, SUBMITTED, EVALUATED. Auto-submit when the timer expires. Allow only one attempt per student unless the instructor allows more.
5. Assignments: instructors create assignments with a deadline. Students submit a text answer or file link. Late submissions are marked. Instructors grade with feedback. Submission states: PENDING, SUBMITTED, LATE, GRADED.
6. Progress tracking: per student per course, show % of materials completed, quiz scores, assignment grades and an overall progress bar. Instructors see a class-level table.
7. Admin panel: user list, approve or deactivate users, course list, simple counts report.

ERROR AND EDGE CASES
Handle: duplicate registration, quiz submitted after time expiry, submitting an assignment after the deadline, invalid token, unauthorized role access, and empty states in the UI. Return consistent JSON error responses.

DATABASE
Design normalised tables (users, courses, enrollments, modules, materials, quizzes, questions, options, quiz_attempts, attempt_answers, assignments, submissions, material_progress). Use primary and foreign keys, constraints and indexes. Provide schema.sql, seed.sql with demo data (1 admin, 2 instructors, 5 students, 3 courses), and an ER diagram in Mermaid.

SECURITY AND ETHICS
Hash passwords, validate all input, use parameterised queries, enable CORS properly, add rate limiting on login, and store no unnecessary personal data. Make the UI accessible (labels, keyboard navigation, good colour contrast).

PROJECT STRUCTURE
/requirements, /planning, /diagrams, /report, /presentation, /backend, /frontend, plus a root README.md containing the title, purpose, team members placeholder, tech stack, setup steps, API list and demo login credentials.

ALSO GENERATE (in /diagrams as Mermaid or PlantUML files)
- DFD Level 0, Level 1, and Level 2 for the quiz module
- A sequence diagram for "student takes and submits a quiz", with the normal flow and the timer-expiry flow
- An architecture diagram with deployment (React on a static host, Node API on a server, PostgreSQL managed DB)

WORKING METHOD
Work in phases and stop after each one so I can test: (1) project setup and database, (2) auth and roles, (3) courses and materials, (4) quizzes, (5) assignments, (6) progress and admin, (7) tests, README and diagrams. After each phase, tell me what files were created, how to run it, and a suggested git commit message. Keep the code clean and commented, and use only features I can explain in a viva. Start with phase 1 only.