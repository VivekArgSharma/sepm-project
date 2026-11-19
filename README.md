# SkillBridge: Online Skill-Based Learning & Course Management System

A full-stack, enterprise-grade learning management platform engineered for a college **Software Engineering & Project Management (SEPM)** project. SkillBridge facilitates course publishing, interactive multi-format lessons, timed auto-evaluated quizzes, deadline-monitored assignments, and granular progress analytics across Students, Instructors, and Administrators.

---

## Team Members Placeholder
- **Student 1 (Lead Developer & System Architect)**: [Name / Roll No / Branch]
- **Student 2 (Backend & Database Engineer)**: [Name / Roll No / Branch]
- **Student 3 (Frontend & UI/UX Developer)**: [Name / Roll No / Branch]
- **Student 4 (QA, Testing & Documentation)**: [Name / Roll No / Branch]

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js & Express with clean layered architecture (`routes`, `controllers`, `services`, `middlewares`, `config`).
- **Database**: PostgreSQL (13 normalized relational tables with foreign keys, cascading constraints, and indexes).
- **Authentication**: Stateless JSON Web Tokens (JWT) with bcrypt password hashing (salt 10) and Role-Based Access Control (RBAC).
- **Validation & Security**: Parameterized SQL queries, Helmet HTTP security headers, CORS protection, rate-limiting, centralized error handling.
- **Testing**: Jest and Supertest.

---

## Directory Structure
```text
sepm/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # 13 normalized tables, constraints & indexes
│   │   └── seed.sql             # Demo data (1 admin, 2 instructors, 5 students, 3 courses)
│   ├── src/
│   │   ├── config/              # PostgreSQL pool & environment configurations
│   │   ├── controllers/         # HTTP request/response orchestrators
│   │   ├── database/            # Automated initDb.js & seedDb.js runners
│   │   ├── middlewares/         # Centralized error, not-found & security handlers
│   │   ├── routes/              # Express API routers (health, auth, etc.)
│   │   ├── services/            # Business logic and database query operations
│   │   ├── utils/               # AppError and standardized JSON response helpers
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Server startup and port binding
│   ├── .env.example             # Template for backend secrets and database credentials
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client with interceptors
│   │   ├── components/layout/   # Navbar, Footer, MainLayout
│   │   ├── pages/               # HomePage, StatusPage, NotFoundPage
│   │   ├── App.jsx              # React Router definitions
│   │   ├── main.jsx             # React DOM root
│   │   └── index.css            # Tailwind CSS directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example             # Template for client environment
│   └── package.json
├── diagrams/                    # Mermaid diagrams (ER diagram, DFDs, Sequence, Architecture)
├── requirements/                # Software Requirements Specification (SRS)
├── planning/                    # Milestones, Gantt schedule & phase tracking
├── report/                      # Comprehensive academic SEPM project report
├── presentation/                # Viva presentation slides & talking points
├── prd.md                       # Product Requirements Document
└── README.md                    # Root project documentation
```

---

## Demo Login Credentials
All pre-seeded demo user accounts are configured with the default password: `Password123!`

| Role | Name | Email | Default Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@skillbridge.edu` | `Password123!` |
| **Instructor 1** | Dr. Robert Smith | `dr.smith@skillbridge.edu` | `Password123!` |
| **Instructor 2** | Prof. Ada Sharma | `prof.ada@skillbridge.edu` | `Password123!` |
| **Student 1** | Alice Walker | `alice@student.edu` | `Password123!` |
| **Student 2** | Bob Miller | `bob@student.edu` | `Password123!` |
| **Student 3** | Charlie Davis | `charlie@student.edu` | `Password123!` |
| **Student 4** | Diana Prince | `diana@student.edu` | `Password123!` |
| **Student 5** | Evan Wright | `evan@student.edu` | `Password123!` |

---

## Getting Started & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ supported)
- **PostgreSQL**: v13.0 or higher
- **npm** or **pnpm**

### 2. Backend Setup
1. Open a terminal in the root directory:
   ```bash
   cd backend
   ```
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the database credentials in `.env` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_HOST` or `DATABASE_URL`).
4. Initialize the PostgreSQL schema and tables:
   ```bash
   npm run db:init
   ```
5. Populate demo courses, users, and quizzes:
   ```bash
   npm run db:seed
   ```
6. Start the development API server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

### 3. Frontend Setup
1. Open a separate terminal:
   ```bash
   cd frontend
   ```
2. Copy the frontend environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   # Accessible at http://localhost:5173
   ```

---

## API Endpoints (Phase 1 Implemented & Subsequent Roadmap)

### Phase 1 Implemented
- `GET /` - Root health ping & API identity
- `GET /api/health` - Comprehensive system uptime, environment, and PostgreSQL connectivity check

### Phase 2: Authentication & RBAC (Next)
- `POST /api/auth/register` - Register a new Student or apply as Instructor
- `POST /api/auth/login` - Authenticate and obtain JWT token
- `GET /api/auth/me` - Retrieve current user profile and role

### Phase 3: Courses & Materials
- `GET /api/courses` - Search and filter course catalog
- `POST /api/courses` - Instructor/Admin creates course
- `POST /api/courses/:id/enroll` - Student course enrollment

### Phase 4: Quizzes
- `GET /api/quizzes/:id` - Fetch quiz details
- `POST /api/quizzes/:id/start` - Initialize timed quiz attempt
- `POST /api/quizzes/:id/submit` - Auto-grade and evaluate submission

### Phase 5: Assignments
- `GET /api/assignments/:id` - Fetch assignment prompt and deadline
- `POST /api/assignments/:id/submit` - Student submit solution
- `POST /api/assignments/:id/grade` - Instructor grade submission

### Phase 6: Progress & Admin
- `GET /api/progress/:courseId` - Calculate completion percentage
- `GET /api/admin/users` - Admin user oversight
- `PATCH /api/admin/users/:id/approve` - Approve instructor accounts
