# Software Requirements Specification (SRS)
## SkillBridge: Online Skill-Based Learning & Course Management System

### 1. Introduction
SkillBridge is a college software engineering project providing a robust, role-based learning management system. It facilitates seamless interactions between students, instructors, and administrators.

### 2. User Classes and Roles
- **Student**:
  - Browse course catalog with search and category filtering.
  - Register and un-register for courses.
  - Access modules, lessons, and multimedia materials (videos, PDFs, external links, text notes).
  - Take timed MCQ quizzes with real-time countdown timer and auto-submission on expiration.
  - Submit assignments (text, links, files) with deadline enforcement and late status.
  - Track individual progress (% of lessons completed, quiz grades, assignment scores).
- **Instructor**:
  - Course creation, editing, and publishing.
  - Module and lesson content management.
  - Create and configure timed MCQ quizzes with mark allocations.
  - Create assignments with deadlines.
  - Grade student submissions with numeric scores and qualitative feedback.
  - View aggregate and student-level progress across owned courses.
- **Administrator**:
  - User management (review, approve instructor applications, deactivate accounts).
  - Course oversight (publish, unpublish, archive).
  - System-wide metric summaries (user counts, enrollments, course stats).

### 3. Non-Functional Requirements
- **Security**: Passwords hashed with bcrypt (salt factor 10), JWT bearer token authentication, role-based route guards, CORS protection, SQL injection prevention via parameterized queries.
- **Usability**: Accessible UI adhering to WCAG contrast standards, keyboard navigable, responsive for mobile and desktop screens.
- **Reliability & Error Handling**: Graceful error handling with standardized JSON formats for duplicate registrations, token expiry, unauthorized role access, and expired quiz attempts.
