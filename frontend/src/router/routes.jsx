// src/router/routes.jsx - FIXED ERROR HANDLING & ROUTING
import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Import your custom error components
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NotFound from '@/components/common/NotFound';

// Direct imports for critical components
import Register from '@/pages/auth/Register';
import VerifyOTP from '@/pages/auth/VerifyOTP';

// ✅ FEEDBACK FORM - Import from forms folder
import FeedbackForm from '@/components/forms/FeedbackForm';

// Lazy load existing pages
const Landing = lazy(() => import('@/pages/Landing'));
const Home = lazy(() => import('@/pages/common/Home'));
const About = lazy(() => import('@/pages/common/About'));
const Contact = lazy(() => import('@/pages/common/Contact'));
const Help = lazy(() => import('@/pages/common/Help'));

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Dashboard pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const FarmerDashboard = lazy(() => import('@/pages/dashboard/FarmerDashboard'));
const BuyerDashboard = lazy(() => import('@/pages/dashboard/BuyerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));

// Market Intelligence
const MarketPrices = lazy(() => import('@/pages/market/MarketPrices'));

// ✅ FEATURES - Correct paths
const WeatherAlerts = lazy(() => import('@/pages/features/WeatherAlerts'));
const DiseaseDetection = lazy(() => import('@/pages/features/DiseaseDetection'));
const AIChatbot = lazy(() => import('@/pages/features/AIChatbot'));
const GovernmentSchemes = lazy(() => import('@/pages/features/GovernmentSchemes'));
const SoilHealth = lazy(() => import('@/pages/features/SoilHealth'));
const B2BMarketplace = lazy(() => import('@/pages/features/B2BMarketplace'));
const CropRecommendations = lazy(() => import('@/pages/features/CropRecommendations'));

// Profile pages
const Profile = lazy(() => import('@/pages/profile/Profile'));
const EditProfile = lazy(() => import('@/pages/profile/EditProfile'));
const Settings = lazy(() => import('@/pages/profile/Settings'));

// ✅ FEEDBACK PAGE WRAPPER
const FeedbackPage = () => {
  return (
    <div className="container mx-auto py-8">
      <FeedbackForm onSubmitSuccess={(result) => {
        console.log('Feedback submitted:', result);
      }} />
    </div>
  );
};

// ✅ CUSTOM ERROR ELEMENT - Use your ErrorBoundary
const CustomErrorElement = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry, but there seems to be an issue with the page you're trying to access.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reload Page
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter([
  // ✅ PUBLIC ROUTES
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <CustomErrorElement />, // ✅ Use custom error element
    children: [
      {
        index: true,
        element: <Landing />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'help',
        element: <Help />
      },
      {
        path: 'feedback',
        element: <FeedbackPage />
      },
      {
        path: 'market-prices',
        element: <MarketPrices />
      },
      {
        path: 'weather',
        element: <WeatherAlerts />
      }
    ]
  },
  
  // ✅ AUTH ROUTES WITH CUSTOM ERROR HANDLING
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout><Login /></AuthLayout>
      </PublicRoute>
    ),
    errorElement: <CustomErrorElement />
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout><Register /></AuthLayout>
      </PublicRoute>
    ),
    errorElement: <CustomErrorElement />
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <AuthLayout><ForgotPassword /></AuthLayout>
      </PublicRoute>
    ),
    errorElement: <CustomErrorElement />
  },
  {
    path: '/verify-otp',
    element: (
      <PublicRoute>
        <AuthLayout><VerifyOTP /></AuthLayout>
      </PublicRoute>
    ),
    errorElement: <CustomErrorElement />
  },

  // ✅ DASHBOARD ROUTES
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'farmer',
        element: (
          <ProtectedRoute requiredRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'buyer',
        element: (
          <ProtectedRoute requiredRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )
      }
    ]
  },

  // ✅ MARKET INTELLIGENCE ROUTES
  {
    path: '/market',
    element: <MainLayout />,
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <MarketPrices />
      }
    ]
  },

  // ✅ WEATHER ROUTES
  {
    path: '/weather-alerts',
    element: <MainLayout />,
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <WeatherAlerts />
      }
    ]
  },

  // ✅ CROP RECOMMENDATIONS
  {
    path: '/crop-recommendations',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <CropRecommendations />
      }
    ]
  },

  // ✅ DISEASE DETECTION
  {
    path: '/disease-detection',
    element: (
      <ProtectedRoute requiredRole="farmer">
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <DiseaseDetection />
      }
    ]
  },

  // ✅ AI CHATBOT
  {
    path: '/ai-chat',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <AIChatbot />
      }
    ]
  },

  // ✅ GOVERNMENT SCHEMES
  {
    path: '/schemes',
    element: (
      <ProtectedRoute requiredRole="farmer">
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <GovernmentSchemes />
      }
    ]
  },

  // ✅ SOIL HEALTH
  {
    path: '/soil-health',
    element: (
      <ProtectedRoute requiredRole="farmer">
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <SoilHealth />
      }
    ]
  },

  // ✅ B2B MARKETPLACE
  {
    path: '/marketplace',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <B2BMarketplace />
      }
    ]
  },

  // ✅ PROFILE ROUTES
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <Profile />
      },
      {
        path: 'edit',
        element: <EditProfile />
      }
    ]
  },

  // ✅ SETTINGS
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <CustomErrorElement />,
    children: [
      {
        index: true,
        element: <Settings />
      }
    ]
  },

  // ✅ CATCH ALL - 404 with custom styling
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
