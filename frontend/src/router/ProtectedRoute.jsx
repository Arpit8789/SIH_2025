// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, fallback = '/auth/login' }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardMap = {
      farmer: '/dashboard/farmer',
      buyer: '/dashboard/buyer', 
      admin: '/dashboard/admin'
    };
    return <Navigate to={dashboardMap[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
