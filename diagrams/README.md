# Software Engineering & Project Management Diagrams
## Project: SkillBridge LMS (Problem #16)

This directory contains the software architecture, process models, and design diagrams required for the SEPM Continuous Comprehensive Assessment (CCA).

---

## 1. Entity-Relationship (ER) Diagram (3NF / BCNF Normalized)
Shows all 13 normalized database tables, primary keys, foreign key constraints, and relational cardinality.

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
    }

    COURSES {
        int id PK
        string title
        text description
        string category
        string level
        int instructor_id FK
        string status
    }

    ENROLLMENTS {
        int id PK
        int student_id FK
        int course_id FK
        string status
        timestamp enrolled_at
    }

    QUIZZES {
        int id PK
        int course_id FK
        string title
        int time_limit_minutes
        decimal total_marks
        decimal passing_marks
        int max_attempts
    }

    QUIZ_ATTEMPTS {
        int id PK
        int quiz_id FK
        int student_id FK
        int attempt_number
        decimal score
        string state "NOT_STARTED | IN_PROGRESS | SUBMITTED | EVALUATED"
    }

    ASSIGNMENTS {
        int id PK
        int course_id FK
        string title
        timestamp deadline
        decimal total_marks
    }

    SUBMISSIONS {
        int id PK
        int assignment_id FK
        int student_id FK
        string state "PENDING | SUBMITTED | LATE | GRADED"
        decimal grade
        text feedback
    }
```

---

## 2. Data Flow Diagrams (DFD) for the Quiz Module

### DFD Level 0 (Context Diagram)
Represents the system boundary and external entity data flows.

```mermaid
graph TD
    Student["Student (External Entity)"]
    Instructor["Instructor (External Entity)"]
    LMS["0.0 Quiz Management & Evaluation Subsystem"]
    DB[("SkillBridge Database")]

    Instructor -->|"Create Quiz & Question Bank"| LMS
    LMS -->|"Confirmation & Quiz Analytics"| Instructor

    Student -->|"Request Quiz Attempt & Submit Answers"| LMS
    LMS -->|"Active Timer, Questions, Evaluated Score"| Student

    LMS <-->|"Read Questions / Store Scores & State"| DB
```

### DFD Level 1 (Subsystem Decomposition)
Decomposes the quiz system into 5 major processes and data stores.

```mermaid
graph TD
    P1["1.0 Author Quiz & MCQs"]
    P2["2.0 Initialize & Validate Attempt"]
    P3["3.0 Monitor Timer & Countdown"]
    P4["4.0 Auto-Grade & Evaluate Answers"]
    P5["5.0 Record Progress & Results"]

    D_Quizzes[("D1: Quizzes Store")]
    D_Questions[("D2: Questions & Options")]
    D_Attempts[("D3: Quiz Attempts")]
    D_Answers[("D4: Attempt Answers")]
    D_Progress[("D5: Student Progress")]

    Inst["Instructor"] -->|"Quiz Metadata & MCQs"| P1
    P1 -->|"Store Quiz Config"| D_Quizzes
    P1 -->|"Store Questions & Answer Key"| D_Questions

    Stud["Student"] -->|"Start Quiz Request"| P2
    D_Quizzes -->|"Check Max Attempts & Time Limit"| P2
    D_Attempts -->|"Check Previous Attempts"| P2
    P2 -->|"Create Attempt (State: IN_PROGRESS)"| D_Attempts
    P2 -->|"Send Questions without Answer Key"| Stud

    Stud -->|"Keep-Alive Session"| P3
    P3 -->|"Timer Expired Signal"| P4

    Stud -->|"Submit Selected Answers"| P4
    D_Questions -->|"Retrieve Correct Option Keys"| P4
    P4 -->|"Calculate Score & Mark EVALUATED"| D_Attempts
    P4 -->|"Store Question Choices"| D_Answers
    P4 -->|"Trigger Progress Update"| P5
    P5 -->|"Update Student Course %"| D_Progress
    P4 -->|"Return Evaluated Score & Review"| Stud
```

### DFD Level 2 (Decomposed Evaluation Process 4.0)
Detailed breakdown of answer verification, scoring, and state transitions.

```mermaid
graph TD
    P4_1["4.1 Verify Attempt Ownership & Time Limit"]
    P4_2["4.2 Match Choices Against Answer Key"]
    P4_3["4.3 Aggregate Marks & Compute Score"]
    P4_4["4.4 Determine Pass/Fail Status"]
    P4_5["4.5 Transition Attempt State to EVALUATED"]

    SubIn["Answers Payload / Auto-Expire Signal"] --> P4_1
    P4_1 -->|"Validated Submission"| P4_2
    D_Options[("Options Store (is_correct)")] -->|"Correct Key"| P4_2
    P4_2 -->|"Per-Question Points"| P4_3
    P4_3 -->|"Total Raw Score"| P4_4
    D_QuizPassing[("Quizzes Store (passing_marks)")] -->|"Pass Threshold"| P4_4
    P4_4 -->|"Final Result Object"| P4_5
    P4_5 -->|"Persisted Result"| OutStud["Student Result Modal"]
```

---

## 3. UML Sequence Diagram: Student Takes and Submits a Quiz
Covers both the **Normal Flow** (submitted within the timer limit) and the **Timer-Expiry Flow** (auto-submission on expiration).

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Browser)
    participant UI as React Frontend (Vite)
    participant API as Express API Server
    participant Auth as Auth Middleware (JWT)
    participant Service as Quiz Service
    participant DB as PostgreSQL / Local Database

    rect rgb(240, 245, 255)
        note over Student, DB: Attempt Initialization Flow
        Student->>UI: Clicks "Start Quiz Attempt"
        UI->>API: POST /api/quizzes/:id/start (Bearer JWT)
        API->>Auth: Verify JWT & extract student ID
        Auth-->>API: Student authenticated (Alice, ID: 4)
        API->>Service: startAttempt(quizId, studentId)
        Service->>DB: Query past attempts for (quizId, studentId)
        DB-->>Service: Return attempts count (0 taken, max: 2)
        Service->>DB: INSERT into quiz_attempts (state: 'IN_PROGRESS', start_time: NOW())
        DB-->>Service: Created attempt record (ID: 101)
        Service->>DB: SELECT questions & options (masking is_correct)
        DB-->>Service: Sanitized questions payload
        Service-->>API: Return { attemptId: 101, timeLimit: 15, questions }
        API-->>UI: 201 Created JSON
        UI->>UI: Start countdown timer (15:00) & display MCQs
    end

    rect rgb(240, 255, 240)
        note over Student, DB: Normal Flow: Student Submits Before Expiry
        Student->>UI: Selects options & clicks "Submit Answers" (Time left: 04:32)
        UI->>UI: Stop countdown timer
        UI->>API: POST /api/quizzes/101/submit { answers: [...], isAutoExpired: false }
        API->>Service: submitAttempt(101, studentId, answers, false)
        Service->>DB: SELECT is_correct FROM options WHERE question_id = ?
        DB-->>Service: Return answer keys
        Service->>Service: Auto-grade: compute marks & pass threshold
        Service->>DB: INSERT into attempt_answers (attempt_id, marks_awarded)
        Service->>DB: UPDATE quiz_attempts SET state = 'EVALUATED', score = 9.0, submit_time = NOW()
        Service-->>API: Evaluated Result: { score: 9.0, total: 10, passed: true }
        API-->>UI: 200 OK Response
        UI-->>Student: Display Passed Modal with score breakdown
    end

    rect rgb(255, 245, 240)
        note over Student, DB: Edge Case Flow: Countdown Timer Expires (00:00)
        UI->>UI: Timer reaches 00:00 (tick triggers auto-submission)
        UI->>UI: Lock UI option selection
        UI->>API: POST /api/quizzes/101/submit { answers: [...], isAutoExpired: true }
        API->>Service: submitAttempt(101, studentId, answers, true)
        Service->>Service: Flag as auto-expired submission
        Service->>DB: Evaluate answers provided up to expiration
        Service->>DB: UPDATE quiz_attempts SET state = 'EVALUATED', score = calculated_score
        Service-->>API: Result { score, passed, auto_expired: true }
        API-->>UI: 200 OK Response
        UI-->>Student: Show "Time Expired - Answers Auto-Evaluated" Banner & Score
    end
```

---

## 4. System Architecture & Deployment Diagram
Shows the 3-tier physical/logical deployment topology from Static Frontend Client to Layered REST API and Persistence.

```mermaid
graph TB
    subgraph Client_Tier ["Presentation Tier (Client Browser)"]
        User["Student / Instructor / Admin"]
        ReactApp["React 18 SPA (Vite + Tailwind CSS)<br/>• React Router v6 Navigation<br/>• AuthContext Session Manager<br/>• Axios Interceptor with JWT<br/>• Countdown Timer Engine"]
        User --> ReactApp
    end

    subgraph Hosting_Frontend ["Static Web Hosting"]
        StaticCDN["Static Web Host / Cloudflare CDN / Vercel / Nginx<br/>Port 5173 (Dev) / Port 80, 443 (Prod)"]
        ReactApp -.-> StaticCDN
    end

    subgraph API_Tier ["Application / Business Logic Tier (Node.js & Express)"]
        ReverseProxy["Reverse Proxy / Helmet & CORS Guard"]
        Router["Express REST API Router"]

        subgraph Middlewares ["Security & Middleware Layer"]
            JWTAuth["JWT Verification & Role RBAC Guard"]
            RateLimit["Rate Limiting & Input Validation"]
            ErrHandler["Centralized Error Handler (AppError)"]
        end

        subgraph Controllers ["Controllers (HTTP Orchestration)"]
            AuthCtrl["Auth Controller"]
            CourseCtrl["Course Controller"]
            QuizCtrl["Quiz & Evaluation Controller"]
            AssignCtrl["Assignment Controller"]
            ProgCtrl["Progress & Analytics Controller"]
            AdminCtrl["Admin Governance Controller"]
        end

        subgraph Services ["Services (Business Logic Layer)"]
            AuthSvc["Auth Service (bcrypt)"]
            CourseSvc["Course Service"]
            QuizSvc["Quiz Engine & Auto-Grader"]
            AssignSvc["Assignment Deadline Service"]
            ProgSvc["Weighted Progress Calculator"]
            AdminSvc["Admin Metrics Service"]
        end

        ReactApp ==>|"HTTPS / REST API JSON Calls"| ReverseProxy
        ReverseProxy --> JWTAuth --> RateLimit --> Router
        Router --> Controllers
        Controllers --> Services
        Services -.-> ErrHandler
    end

    subgraph Data_Tier ["Persistence & Data Tier"]
        DBAdapter["Unified Database Adapter (db.js)"]
        Services ==> DBAdapter

        subgraph Storage_Options ["Storage Deployments"]
            LocalDB[("Local Dev Persistence<br/>Zero-setup JSON / SQLite Engine<br/>skillbridge.db / local_store.json")]
            PostgresCloud[("Production Enterprise Tier<br/>Managed PostgreSQL Database<br/>Port 5432 • Connection Pool (pg)")]
        end

        DBAdapter -->|"Offline / Local Dev"| LocalDB
        DBAdapter -.->|"Cloud / Production URI"| PostgresCloud
    end
```
