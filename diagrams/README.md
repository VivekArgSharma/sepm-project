# System Architecture & Database Diagrams

This folder contains the software engineering diagrams for **SkillBridge: Online Skill-Based Learning & Course Management System**.

---

## 1. Entity-Relationship (ER) Diagram

The database schema is fully normalized (conforming to 3NF / BCNF) and consists of 13 interconnected entities.

```mermaid
erDiagram
    USERS ||--o{ COURSES : "instructs"
    USERS ||--o{ ENROLLMENTS : "registers"
    USERS ||--o{ MATERIAL_PROGRESS : "completes"
    USERS ||--o{ QUIZ_ATTEMPTS : "takes"
    USERS ||--o{ SUBMISSIONS : "submits"
    USERS ||--o{ SUBMISSIONS : "grades"

    COURSES ||--o{ ENROLLMENTS : "has_students"
    COURSES ||--o{ MODULES : "contains"
    COURSES ||--o{ QUIZZES : "has_assessments"
    COURSES ||--o{ ASSIGNMENTS : "has_tasks"
    COURSES ||--o{ MATERIAL_PROGRESS : "tracks"

    MODULES ||--o{ MATERIALS : "holds"
    MODULES ||--o{ QUIZZES : "groups"
    MODULES ||--o{ ASSIGNMENTS : "groups"

    MATERIALS ||--o{ MATERIAL_PROGRESS : "monitored_by"

    QUIZZES ||--o{ QUESTIONS : "includes"
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "attempted_by"

    QUESTIONS ||--o{ OPTIONS : "has_choices"
    QUESTIONS ||--o{ ATTEMPT_ANSWERS : "evaluated_in"

    OPTIONS ||--o{ ATTEMPT_ANSWERS : "selected_in"

    QUIZ_ATTEMPTS ||--o{ ATTEMPT_ANSWERS : "contains"

    ASSIGNMENTS ||--o{ SUBMISSIONS : "receives"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "STUDENT | INSTRUCTOR | ADMIN"
        string status "ACTIVE | PENDING | DEACTIVATED"
        string bio
        timestamp created_at
        timestamp updated_at
    }

    COURSES {
        int id PK
        string title
        text description
        string category
        string level "Beginner | Intermediate | Advanced"
        int instructor_id FK
        string status "DRAFT | PUBLISHED | ARCHIVED"
        timestamp created_at
        timestamp updated_at
    }

    ENROLLMENTS {
        int id PK
        int student_id FK
        int course_id FK
        string status "ENROLLED | DROPPED | COMPLETED"
        timestamp enrolled_at
    }

    MODULES {
        int id PK
        int course_id FK
        string title
        text description
        int order_index
        timestamp created_at
        timestamp updated_at
    }

    MATERIALS {
        int id PK
        int module_id FK
        string title
        text description
        string content_type "VIDEO | PDF | LINK | TEXT"
        text url_or_path
        int order_index
        timestamp created_at
        timestamp updated_at
    }

    MATERIAL_PROGRESS {
        int id PK
        int student_id FK
        int course_id FK
        int material_id FK
        boolean completed
        timestamp completed_at
    }

    QUIZZES {
        int id PK
        int course_id FK
        int module_id FK
        string title
        text description
        int time_limit_minutes
        decimal total_marks
        decimal passing_marks
        int max_attempts
        timestamp created_at
        timestamp updated_at
    }

    QUESTIONS {
        int id PK
        int quiz_id FK
        text question_text
        decimal marks
        int order_index
        timestamp created_at
    }

    OPTIONS {
        int id PK
        int question_id FK
        text option_text
        boolean is_correct
        int order_index
    }

    QUIZ_ATTEMPTS {
        int id PK
        int quiz_id FK
        int student_id FK
        int attempt_number
        timestamp start_time
        timestamp submit_time
        decimal score
        string state "NOT_STARTED | IN_PROGRESS | SUBMITTED | EVALUATED"
        timestamp created_at
        timestamp updated_at
    }

    ATTEMPT_ANSWERS {
        int id PK
        int attempt_id FK
        int question_id FK
        int selected_option_id FK
        boolean is_correct
        decimal marks_awarded
        timestamp created_at
    }

    ASSIGNMENTS {
        int id PK
        int course_id FK
        int module_id FK
        string title
        text description
        timestamp deadline
        decimal total_marks
        timestamp created_at
        timestamp updated_at
    }

    SUBMISSIONS {
        int id PK
        int assignment_id FK
        int student_id FK
        string submission_type "TEXT | LINK | FILE"
        text content
        timestamp submitted_at
        string state "PENDING | SUBMITTED | LATE | GRADED"
        decimal grade
        text feedback
        int graded_by FK
        timestamp graded_at
        timestamp updated_at
    }
```

---

## 2. Upcoming Phase Diagrams (To be generated in Phase 7)
- DFD Level 0, Level 1, and Level 2 for the Quiz Module
- Sequence Diagram: Student Takes and Submits a Quiz (Normal & Time-Expiry flow)
- Architecture and Cloud Deployment Diagram
