// src/router/ProtectedRoute.jsx - FIXED WITH CASE-INSENSITIVE COMPARISON
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, fallback = '/auth/login' }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute: Component rendered');
  console.log('🔒 ProtectedRoute: requiredRole =', requiredRole);
  console.log('🔒 ProtectedRoute: user role =', user?.role);
  console.log('🔒 ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('🔒 ProtectedRoute: isLoading =', isLoading);
  console.log('🔒 ProtectedRoute: location =', location.pathname);

  // Show loading while checking authentication
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Showing loading spinner');
    return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // ✅ FIX: Case-insensitive role comparison
  const userRole = user?.role?.toLowerCase();
  const requiredRoleNormalized = requiredRole?.toLowerCase();
  
  console.log('🔍 ProtectedRoute: Normalized user role =', userRole);
  console.log('🔍 ProtectedRoute: Normalized required role =', requiredRoleNormalized);

  // Check role-based access with case-insensitive comparison
  if (requiredRoleNormalized && userRole !== requiredRoleNormalized) {
    console.log('🚫 ProtectedRoute: Role mismatch, redirecting based on user role');
    
    // ✅ FIX: Use normalized roles for dashboard mapping
    const dashboardMap = {
      Farmer: '/dashboard/farmer',
      buyer: '/dashboard/buyer', 
      admin: '/dashboard/admin'
    };
    
    const redirectPath = dashboardMap[userRole] || '/dashboard';
    console.log('🎯 ProtectedRoute: Redirecting to', redirectPath);
    
    return <Navigate to={redirectPath} replace />;
  }

  console.log('✅ ProtectedRoute: All checks passed, rendering children');
  return children;
};

export default ProtectedRoute;
