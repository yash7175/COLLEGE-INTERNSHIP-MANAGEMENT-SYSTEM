# College Internship Management System (CIMS)

> A production-ready, full-stack enterprise web application designed to manage and optimize university student internships, faculty oversight, partner company recruitment, interview schedules, performance evaluations, and accredited institutional placement analytics.

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://mysql.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-indigo.svg)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan.svg)](https://tailwindcss.com)

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Role-Based Access Control](#role-based-access-control)
- [Prerequisites & Local MySQL Setup](#prerequisites--local-mysql-setup)
- [Getting Started Locally](#getting-started-locally)
- [Demo Credentials](#demo-credentials)
- [Automated Integration Testing](#automated-integration-testing)
- [API Documentation](#api-documentation)
- [Cloud Deployment](#cloud-deployment)
- [Security & Compliance](#security--compliance)
- [Future Enhancements](#future-enhancements)

---

## Overview & Key Features

The College Internship Management System provides a complete relational data management platform for academic institutions and industry partners:

### 🎓 Student Module
- **Interactive Dashboard:** Live counts of applied, pending, shortlisted, and accepted offers.
- **Search & Filter Internships:** Keyword search, industry domain filters, location filters, and stipend ranges.
- **Application Workflow & Timeline:** Submit cover letters, select qualifications, attach verified PDF resumes, and track progress along an interactive milestone timeline (`Applied` → `Reviewed` → `Shortlisted` → `Interview` → `Offer`).
- **Duplicate Prevention:** Strict enforcement both in application logic and MySQL database unique constraints preventing students from applying more than once to the same position.
- **Interview Hub:** View upcoming video meeting links, interviewer panel notes, and results.
- **Employer Ratings:** Submit 5-star ratings across Company Culture, Mentorship Quality, Technical Learning, and Work Environment.
- **PDF Resume Management:** Upload and manage PDF resumes (max 5 MB) stored safely outside version control.

### 👨‍🏫 Faculty Module
- **Author & Manage Postings:** Create positions with company links, duration (4–26 weeks), stipends, and deadlines.
- **Applicant Review:** Shortlist, reject, or accept candidates.
- **Schedule Technical Interviews:** Schedule with 24-hour advance notice validation, panel assignments, and video links.
- **6-Criteria Competency Evaluation:** Grade technical skills, soft skills, punctuality, responsibility, teamwork, and learning ability (1–5) with automatic overall score calculation.
- **Departmental Reports:** Track student conversion funnels and export candidate reports as CSV.

### 🛡️ Administrative Governance
- **Executive KPI Dashboard:** Real-time placement rates, average compensation, employer counts, and Recharts visual analytics.
- **User Directory:** Create accounts, toggle active/deactivate flags, verify credentials, and manage passwords.
- **Company Management:** Register corporate partners with unique registration numbers, archive organizations, and monitor feedback.
- **Posting Approval Workflow:** Audit incoming internship postings (`pending_approval` → `approved` / `closed`).
- **Institutional Compliance Reports:** Official audit reports, student GPA rankings, company reviews, and full CSV exports.
- **System Feedback Desk:** Review bug reports and feature suggestions with tracked resolution statuses.

---

## System Architecture

```
college-internship-management-system/
│
├── frontend/                     # React + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/common/    # Navbar, Sidebar, Modals, StatusBadge, Spinners
│   │   ├── context/              # AuthContext & Session Management
│   │   ├── layouts/              # DashboardLayout
│   │   ├── pages/                # Student, Faculty, Admin, and Public views
│   │   ├── services/api.ts       # Configured Axios client with JWT interceptors
│   │   ├── types/index.ts        # TypeScript domain models
│   │   └── App.tsx               # Client router with Role guards
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + Prisma REST API
│   ├── src/
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # JWT Auth, Role Guards, Multer Upload, ErrorHandler
│   │   ├── routes/               # Modular Express routers mounted at /api
│   │   ├── utils/                # Prisma singleton, JWT helpers, Response formatters
│   │   ├── validators/           # Strict regex & date business validation
│   │   └── server.ts             # Express application & server listener
│   ├── prisma/
│   │   ├── schema.prisma         # MySQL Prisma schema with models & constraints
│   │   └── seed.ts               # Database seeder with demo accounts & fixtures
│   ├── tests/
│   │   └── api-workflow.test.ts  # Automated end-to-end integration test suite
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # Architecture & Operational Documentation
│   ├── API.md                    # REST API Endpoints & Request/Response schemas
│   ├── DATABASE.md               # Normalized relational schema & ER diagram
│   └── DEPLOYMENT.md             # Production cloud deployment guide
│
├── .gitignore
├── README.md
├── PROJECT_STATUS.md
└── package.json                  # Monorepo root workspace configuration
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, REST API Architecture |
| **Database** | MySQL (Port 3306), Prisma ORM |
| **Authentication** | JSON Web Tokens (JWT), bcrypt password hashing, RBAC |
| **Security** | Helmet HTTP security headers, CORS origin whitelisting, Express Rate Limiting |
| **Testing** | Automated integration tests (`tests/api-workflow.test.ts`) |

---

## Database Design

The system runs on **MySQL** with strict referential integrity, indexes, and unique constraints managed through Prisma.

Key relational entities:
- `User` (Authentication, password hash, role enum, verification)
- `Student` (Department, phone, GPA 0.0–4.0, resume link)
- `Faculty` (Department, phone, advisory assignments)
- `Company` (Name, unique registration number, contact person, status)
- `Internship` (Domain, duration 4–26 weeks, stipend, deadline, status)
- `Application` (Unique constraint `[studentId, internshipId]`, cover letter, qualifications)
- `ApplicationTimeline` (Audit trail of status transitions with reviewer notes)
- `Interview` (24-hour advance notice, panel assignment, video link, decision outcome)
- `Evaluation` (6 criteria scores 1–5, computed overall rating, faculty notes)
- `Feedback` (Student review across 5 star categories and suggestions)
- `Resume` (Uploaded verified PDF documents)
- `Notification` (Real-time application, interview, and system alerts)
- `SystemFeedback` (User bug reports and enhancement tickets)

For comprehensive entity definitions and the visual ER diagram, see [DATABASE.md](docs/DATABASE.md).

---

## Role-Based Access Control

The application strictly enforces role-based access control across all API routes and frontend pages:

| Role | Permissions & Scope |
|---|---|
| **STUDENT** | Can only browse internships, view/update their own profile, upload/delete their own resumes, apply to positions, withdraw their applications, track their status timeline, view scheduled interviews, and submit ratings for completed internships. |
| **FACULTY** | Can create and update their assigned internship postings, review candidate applications, shortlist/reject candidates, schedule interviews, and record 6-point competency evaluations. |
| **ADMIN** | Full administrative governance across users (create/deactivate/verify), partner companies, internship approvals, campus-wide applications, system feedback resolution, and executive placement audit reports. |

---

## Prerequisites & Local MySQL Setup

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL / MariaDB Server** (running locally on port 3306)

### 1. Initialize the MySQL Database
Log into MySQL and create the database:
```sql
CREATE DATABASE IF NOT EXISTS college_internship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Backend Environment
Create `backend/.env` (based on `backend/.env.example`):
```env
DATABASE_URL="mysql://root:password@localhost:3306/college_internship"
JWT_SECRET="your_jwt_super_secret_key_change_in_production"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
UPLOAD_DIR="./uploads"
```

### 3. Configure Frontend Environment
Create `frontend/.env` (based on `frontend/.env.example`):
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## Getting Started Locally

### 1. Install Dependencies
```bash
# From the root directory:
npm install --workspace=backend
npm install --workspace=frontend
npm install --save-dev concurrently
```

### 2. Run Database Migrations & Seeding
```bash
# Push schema to MySQL database:
npm run prisma:generate --workspace=backend
npm run prisma:push --workspace=backend

# Seed demo accounts and realistic sample records:
npm run prisma:seed --workspace=backend
```

### 3. Launch Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or start each separately:
```bash
# Terminal 1 (Backend API on http://localhost:5000):
npm run dev:backend

# Terminal 2 (Frontend Client on http://localhost:5173):
npm run dev:frontend
```

---

## Demo Credentials

The database seed provisions active demo accounts for all three user roles:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Password@123` | Institutional Director (Full Access) |
| **Faculty** | `faculty@example.com` | `Password@123` | Dr. Evelyn Reed (Computer Science & Engineering) |
| **Faculty 2** | `faculty2@example.com` | `Password@123` | Prof. Marcus Vance (Data Science & AI) |
| **Student** | `student@example.com` | `Password@123` | Alex Morgan (CS, GPA 3.85, Placed) |
| **Student 2** | `student2@example.com` | `Password@123` | Sophia Chen (CS, GPA 3.92, Shortlisted) |
| **Student 3** | `student3@example.com` | `Password@123` | Liam Patel (IS, GPA 3.65, Pending) |

> **Tip:** The Login page features **One-Click Demo Login** buttons for instant testing of Student, Faculty, and Admin interfaces without typing credentials.

---

## Automated Integration Testing

An automated integration test suite exercises end-to-end user workflows against the live MySQL database:
```bash
npm run test --workspace=backend
```

Tests validate:
- Database connectivity & health ping (`/api/health`)
- Rejection of invalid credentials
- Admin, Faculty, and Student JWT authentication
- Role guard enforcement (Student forbidden from `/api/users`, Admin allowed)
- Password complexity validation rules (min 8 chars, uppercase, lowercase, digit, special symbol)
- Phone number international format validation (10–15 digits)
- Internship domain, stipend, and status filtering
- Duplicate application prevention (MySQL unique constraint test returns HTTP 409)
- Interview schedule validation (enforcing minimum 24 hours advance notice)
- Administrative and Student reporting calculations

---

## API Documentation

For complete endpoint contracts, query parameters, request bodies, and JSON responses, refer to:
📖 [docs/API.md](docs/API.md)

---

## Cloud Deployment

For production deployment instructions including managed MySQL provisioning, environment variables, frontend static hosting, and CORS configuration, refer to:
🚀 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## Security & Compliance

- **No Plaintext Passwords:** All credentials hashed using `bcryptjs` with salt rounds.
- **SQL Injection Prevention:** Parameterized queries strictly generated through Prisma ORM.
- **Zero Secrets Committed:** `.env` files are excluded via `.gitignore`.
- **Upload Hardening:** Resumes restricted strictly to `.pdf` format with a 5 MB maximum size limit.
- **Rate Limiting:** Authentication routes protected against brute-force attacks via `express-rate-limit`.

---

## Future Enhancements

- OAuth2 integration with Google / Microsoft institutional SSO.
- Automated calendar invite export (`.ics` / Google Calendar Sync) for scheduled interviews.
- Direct PDF resume viewing preview modal in browser.
- Real-time WebSocket notifications.
