import http from 'http';
import app from '../src/server';
import prisma from '../src/utils/prisma';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = async (
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
  } = {}
) => {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: any = await response.json().catch(() => ({}));
  return { status: response.status, data };
};

async function runTests() {
  console.log('🧪 Starting Full-Stack Backend & MySQL Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, details?: any) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  };

  try {
    // 1. Health check & Database ping
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'API Health Check & MySQL Connection', health.data);

    // 2. Auth: Invalid login
    const invalidLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'WrongPassword999!' },
    });
    assert(invalidLogin.status === 401, 'Authentication rejects incorrect password');

    // 3. Auth: Valid Admin login
    const adminLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'Password@123' },
    });
    assert(adminLogin.status === 200 && !!adminLogin.data.data?.token, 'Admin login successfully generates JWT token');
    const adminToken = adminLogin.data.data?.token;

    // 4. Auth: Valid Student login
    const studentLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'student@example.com', password: 'Password@123' },
    });
    assert(studentLogin.status === 200 && !!studentLogin.data.data?.token, 'Student login successfully generates JWT token');
    const studentToken = studentLogin.data.data?.token;

    // 5. Auth: Valid Faculty login
    const facultyLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'faculty@example.com', password: 'Password@123' },
    });
    assert(facultyLogin.status === 200 && !!facultyLogin.data.data?.token, 'Faculty login successfully generates JWT token');
    const facultyToken = facultyLogin.data.data?.token;

    // 6. Role Authorization: Student cannot access Admin Users endpoint
    const forbiddenCheck = await makeRequest('/users', {
      token: studentToken,
    });
    assert(forbiddenCheck.status === 403, 'Role Guard: Student is forbidden from accessing Admin User Management');

    // 7. Role Authorization: Admin CAN access Users endpoint
    const adminUsersCheck = await makeRequest('/users', {
      token: adminToken,
    });
    assert(adminUsersCheck.status === 200 && Array.isArray(adminUsersCheck.data.data), 'Role Guard: Admin can access User Management');

    // 8. Validation: Password complexity on registration
    const weakPassRegister = await makeRequest('/auth/register', {
      method: 'POST',
      body: {
        email: 'testweak@example.com',
        password: 'weak',
        name: 'Weak User',
        phone: '+15551234567',
        department: 'CS',
        GPA: 3.5,
      },
    });
    assert(weakPassRegister.status === 400, 'Registration rejects weak passwords (<8 chars or missing complexity)');

    // 9. Validation: Phone format
    const badPhoneRegister = await makeRequest('/auth/register', {
      method: 'POST',
      body: {
        email: 'testphone@example.com',
        password: 'Password@123',
        name: 'Test Phone',
        phone: '123', // too short
        department: 'CS',
        GPA: 3.5,
      },
    });
    assert(badPhoneRegister.status === 400, 'Registration rejects invalid phone numbers');

    // 10. Internships: Browse and filter
    const internships = await makeRequest('/internships?domain=Software%20Engineering');
    assert(internships.status === 200 && internships.data.data.length > 0, 'Internship domain filter returns matching internships');

    // 11. Applications: Duplicate Application Prevention
    // Student 1 (Alex) is already accepted for Internship 1 in the seed data
    const myAppsRes = await makeRequest('/applications/my', { token: studentToken });
    const existingApp = myAppsRes.data?.data?.[0];
    const existingInternshipId = existingApp?.internshipId || 1;

    const duplicateApp = await makeRequest('/applications/apply', {
      method: 'POST',
      token: studentToken,
      body: {
        internshipId: existingInternshipId,
        coverLetter: 'Attempting to apply a second time for the same internship...',
        qualifications: 'React, Node.js',
      },
    });
    assert(duplicateApp.status === 409, 'Duplicate Application Guard: Prevents student applying twice to same internship');

    // 12. Interview: 24h notice validation
    const allAppsRes = await makeRequest('/applications', { token: facultyToken });
    const pendingApp = allAppsRes.data?.data?.find((a: any) => a.status === 'pending') || allAppsRes.data?.data?.[0];
    const pendingAppId = pendingApp?.id || 1;

    const pastInterview = await makeRequest('/interviews/schedule', {
      method: 'POST',
      token: facultyToken,
      body: {
        applicationId: pendingAppId,
        interviewDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // only 2 hours from now!
        interviewer: 'Dr. Evelyn Reed',
      },
    });
    assert(pastInterview.status === 400, 'Interview Scheduling enforces at least 24 hours advance notice');

    // 13. Reports: Admin dashboard stats
    const adminStats = await makeRequest('/reports/admin/stats', {
      token: adminToken,
    });
    assert(
      adminStats.status === 200 && adminStats.data.data?.summary?.totalStudents > 0,
      'Admin Dashboard Stats computed correctly',
      adminStats.data.data?.summary
    );

    // 14. Reports: Student dashboard stats
    const studentStats = await makeRequest('/reports/student/stats', {
      token: studentToken,
    });
    assert(
      studentStats.status === 200 && studentStats.data.data?.summary?.myApplications > 0,
      'Student Dashboard Stats computed correctly'
    );

    console.log(`\n=======================================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=======================================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Start server on test port and run
const testPortServer = app.listen(PORT, () => {
  runTests();
});
