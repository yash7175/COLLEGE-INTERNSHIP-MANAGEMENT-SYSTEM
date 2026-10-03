import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BrowseInternshipsPage } from './pages/BrowseInternshipsPage';
import { InternshipDetailPage } from './pages/InternshipDetailPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { SystemFeedbackPage } from './pages/SystemFeedbackPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentInterviewsPage } from './pages/student/StudentInterviewsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyInternshipsPage } from './pages/faculty/FacultyInternshipsPage';
import { FacultyApplicationsPage } from './pages/faculty/FacultyApplicationsPage';
import { FacultyInterviewsPage } from './pages/faculty/FacultyInterviewsPage';
import { FacultyEvaluationsPage } from './pages/faculty/FacultyEvaluationsPage';
import { FacultyReportsPage } from './pages/faculty/FacultyReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminInternshipsPage } from './pages/admin/AdminInternshipsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Core Browsing & Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/internships" element={<BrowseInternshipsPage />} />
            <Route path="/internships/:id" element={<InternshipDetailPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route
              path="/feedback/system"
              element={
                <ProtectedRoute>
                  <SystemFeedbackPage />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/interviews"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Faculty Protected Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/internships"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyInternshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/applications"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/interviews"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/evaluations"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyEvaluationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/reports"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/internships"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminInternshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminFeedbackPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
