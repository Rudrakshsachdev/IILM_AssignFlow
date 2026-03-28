import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Hero from '../components/Hero/Hero';
import AuthForm from '../components/AuthForm/AuthForm';
import ProtectedRoute from './ProtectedRoute';
import StudentDashboard from '../pages/StudentDashboard/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard/FacultyDashboard';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import Unauthorized from '../pages/Unauthorized/Unauthorized';
import Profile from '../pages/Profile/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<AuthForm type="login" />} />
      <Route path="/signup" element={<AuthForm type="signup" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes specific to roles */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/faculty-dashboard"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Legacy dashboard fallback */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

