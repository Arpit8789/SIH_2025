// src/router/AppRouter.jsx
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const AppRouter = () => {
  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the application routing. Please refresh the page.">
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading application..." />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
