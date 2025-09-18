// src/router/PublicRoute.jsx - ADD EXTENSIVE DEBUGGING
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  console.log('🔒 PublicRoute: Component rendering');
  console.log('🔒 PublicRoute: children =', children);
  console.log('🔒 PublicRoute: redirectTo =', redirectTo);

  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('🔒 PublicRoute: isAuthenticated =', isAuthenticated);
  console.log('🔒 PublicRoute: isLoading =', isLoading);

  // Show loading while checking authentication
  if (isLoading) {
    console.log('⏳ PublicRoute: Showing loading spinner');
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    console.log('🔄 PublicRoute: User authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ PublicRoute: Rendering children');
  console.log('✅ PublicRoute: children type =', typeof children);
  console.log('✅ PublicRoute: children props =', children?.props);
  
  return children;
};

export default PublicRoute;
