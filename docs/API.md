# College Internship Management System (CIMS) - REST API Documentation

The College Internship Management System backend is built with Node.js, Express, TypeScript, and Prisma ORM connecting to a MySQL database.

## Base URL & General Configuration

- **Development Local Base URL:** `http://localhost:5000/api`
- **Health Check Endpoint:** `GET http://localhost:5000/api/health`
- **Content-Type:** `application/json` (or `multipart/form-data` for resume uploads)

---

## Authentication & Headers

Protected routes require an Authorization Bearer token header:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Tokens are valid for 7 days upon generation.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register
`POST /api/auth/register`
- **Public**
- **Description:** Registers a new Student or Faculty user account.
- **Request Body:**
```json
{
  "email": "alex.morgan@university.edu",
  "password": "Password@123",
  "role": "STUDENT",
  "name": "Alex Morgan",
  "phone": "+1-555-014-9923",
  "department": "Computer Science",
  "GPA": 3.85
}
```
- **Validation Rules:**
  - Password requires minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.
  - Phone requires 10 to 15 digits supporting international notation.
  - Student role requires valid numeric GPA between 0.0 and 4.0.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "alex.morgan@university.edu",
      "role": "STUDENT",
      "name": "Alex Morgan",
      "studentId": 1
    }
  }
}
```

### 1.2 Login
`POST /api/auth/login`
- **Public**
- **Rate Limit:** 100 requests per 15 minutes.
- **Request Body:**
```json
{
  "email": "student@example.com",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 3,
      "email": "student@example.com",
      "role": "STUDENT",
      "name": "Alex Morgan"
    }
  }
}
```

### 1.3 Get Current User Profile
`GET /api/auth/me`
- **Protected** (All Roles)
- **Response (200 OK):** Returns user details, notifications, and profile relation.

### 1.4 Forgot Password
`POST /api/auth/forgot-password`
- **Request Body:** `{ "email": "student@example.com" }`

### 1.5 Reset Password
`POST /api/auth/reset-password`
- **Request Body:** `{ "resetToken": "...", "newPassword": "NewPassword@123" }`

---

## 2. Student Endpoints (`/api/students`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students/profile` | Student / Admin | Get authenticated student's full profile |
| `PUT` | `/api/students/profile` | Student | Update profile name, phone, department, GPA |
| `POST` | `/api/students/resume` | Student | Upload verified PDF resume (Max 5 MB) |
| `GET` | `/api/students/resumes` | Student | List uploaded PDF resumes |
| `DELETE` | `/api/students/resumes/:id` | Student / Admin | Delete an uploaded resume |
| `GET` | `/api/students` | Admin | List all students with search and pagination |

---

## 3. Company Endpoints (`/api/companies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/companies` | Public | List partner companies with search, filter, avg ratings |
| `GET` | `/api/companies/:id` | Public | Get company details, positions, and reviews |
| `POST` | `/api/companies` | Admin | Register new partner company (unique Reg No required) |
| `PUT` | `/api/companies/:id` | Admin | Update employer profile |
| `PATCH` | `/api/companies/:id/archive` | Admin | Transition company status to archived |
| `DELETE` | `/api/companies/:id` | Admin | Delete company record |

---

## 4. Internship Endpoints (`/api/internships`)

### 4.1 Browse & Search Internships
`GET /api/internships`
- **Public**
- **Query Parameters:**
  - `search`: Keyword string matching title, description, or employer
  - `domain`: Industry category filter
  - `location`: Location string
  - `minStipend`: Numeric minimum compensation
  - `status`: draft, pending_approval, approved, active, closed
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 10)

### 4.2 Create Internship
`POST /api/internships`
- **Protected** (Faculty & Admin)
- **Validation:**
  - Start date must be before end date.
  - Duration must be between 4 and 26 weeks.
  - Application deadline must be on or before start date.

---

## 5. Application Endpoints (`/api/applications`)

### 5.1 Submit Application
`POST /api/applications/apply`
- **Protected** (Student Only)
- **Body / Multipart:**
  - `internshipId`: Integer ID of position
  - `coverLetter`: String (min 10 characters)
  - `qualifications`: String (min 5 characters)
  - `resume`: Optional multipart file (PDF, max 5 MB). If omitted, student's primary resume is used.
- **Duplicate Prevention:**
  - Enforced in application code and MySQL unique key `@@unique([studentId, internshipId])`. Returns HTTP `409 Conflict` if duplicate application is attempted.

### 5.2 My Applications
`GET /api/applications/my`
- **Protected** (Student Only)
- Returns applications with interactive status timeline.

### 5.3 Review Applications
`GET /api/applications`
- **Protected** (Faculty & Admin)
- Returns applications for managed internships.

### 5.4 Update Status
`PATCH /api/applications/:id/status`
- **Protected** (Faculty / Admin / Student for withdraw)
- Statuses: `pending`, `shortlisted`, `rejected`, `accepted`, `withdrawn`.

---

## 6. Interview Endpoints (`/api/interviews`)

### 6.1 Schedule Interview
`POST /api/interviews/schedule`
- **Protected** (Faculty & Admin)
- **Validation:** Minimum 24 hours advance notice required.

### 6.2 Update Interview / Record Outcome
`PUT /api/interviews/:id`
- **Protected** (Faculty & Admin)
- Records decision: `pending`, `passed`, `failed`, `rescheduled`. Passing automatically updates application status to `accepted`.

---

## 7. Evaluation & Feedback Endpoints

- `POST /api/evaluations`: Records 6-criteria competency evaluation (Technical skills, Soft skills, Punctuality, Responsibility, Teamwork, Learning ability: 1-5).
- `POST /api/feedback/student`: Student evaluates employer (Culture, Mentorship, Technical Learning, Work Environment, Overall: 1-5 stars).
- `POST /api/feedback/system`: Report bugs and feature requests.
- `PATCH /api/feedback/system/:id`: Admin responds and closes tickets.

---

## 8. Reports & Analytics Endpoints (`/api/reports`)

- `GET /api/reports/admin/stats`: Executive summary KPI counts and Recharts analytics.
- `GET /api/reports/admin`: Institutional audit report (Placement summary, application analytics, student GPA standings, employer metrics).
- `GET /api/reports/faculty/stats`: Faculty-specific recruitment stats.
- `GET /api/reports/student/stats`: Student application progress and interview schedules.
