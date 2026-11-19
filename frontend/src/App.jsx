import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizTakePage from './pages/QuizTakePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TablesPage from './pages/TablesPage';
import StatusPage from './pages/StatusPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            
            {/* Protected Routes */}
            <Route
              path="quiz/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                  <QuizTakePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="instructor"
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <InstructorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="tables" element={<TablesPage />} />
            <Route path="status" element={<StatusPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
