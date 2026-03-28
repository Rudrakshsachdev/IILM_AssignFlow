import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing/Landing';
import AuthForm from '../components/AuthForm/AuthForm';
import ProtectedRoute from './ProtectedRoute';
import StudentDashboard from '../pages/StudentDashboard/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard/FacultyDashboard';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import Unauthorized from '../pages/Unauthorized/Unauthorized';
import Profile from '../pages/Profile/Profile';
import FacultyProfile from '../pages/Profile/FacultyProfile';
import ResetPassword from '../pages/Auth/ResetPassword';
import CreateAssignment from '../pages/FacultyDashboard/CreateAssignment';
import AssignmentDetails from '../pages/StudentDashboard/AssignmentDetails';
import StudentAssignments from '../pages/StudentDashboard/StudentAssignments';
import ForgotPassword from '../pages/Auth/ForgotPassword';

const AppRoutes = () => {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<AuthForm type="login" />} />
      <Route path="/signup" element={<AuthForm type="signup" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
        path="/student-dashboard/assignments"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard/assignment/:id"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AssignmentDetails />
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
        path="/faculty-dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty-dashboard/create-assignment"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <CreateAssignment />
          </ProtectedRoute>
        }
      />

      {/* Legacy dashboard fallback */}

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

