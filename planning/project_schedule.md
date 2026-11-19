# Project Plan & Development Phases

## SkillBridge LMS Engineering Roadmap

| Phase | Milestone | Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Project Setup & Database** | Root structure, Express backend, React Vite frontend, normalized PostgreSQL schema (13 tables), seed data (1 admin, 2 instructors, 5 students, 3 courses), ER diagram | **Completed** |
| **Phase 2** | **Auth & Role-Based Access Control** | User registration, login, logout, bcrypt hashing, JWT tokens, auth middlewares, role guards (Student, Instructor, Admin) | *Next* |
| **Phase 3** | **Courses & Learning Materials** | Course catalog, search/filter, CRUD for instructors/admins, module management, lesson content (Video, PDF, Link, Text) | *Pending* |
| **Phase 4** | **Quizzes & Auto-evaluation Engine** | MCQ builder, timed quiz-taking engine, countdown timer, auto-submit on expiry, attempt states | *Pending* |
| **Phase 5** | **Assignments & Grading** | Assignment creation, deadline validation, student submissions (text/link), grading & instructor feedback | *Pending* |
| **Phase 6** | **Progress Tracking & Admin Panel** | Per-student completion calculation, instructor class tables, admin user approval & system stats | *Pending* |
| **Phase 7** | **Testing, Documentation & Diagrams** | Jest + Supertest API test suite, DFD Levels 0/1/2, Sequence Diagram, Architecture diagram, Final README | *Pending* |
