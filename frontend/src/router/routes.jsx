// src/router/routes.jsx - CORRECTED PATHS FOR FEEDBACK & B2B
import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
const NotFound = lazy(() => import('@/pages/common/NotFound'));

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Dashboard pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const FarmerDashboard = lazy(() => import('@/pages/dashboard/FarmerDashboard'));
const BuyerDashboard = lazy(() => import('@/pages/dashboard/BuyerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));

// Market Intelligence (keep existing path - it's working)
const MarketPrices = lazy(() => import('@/pages/market/MarketPrices'));

// ✅ FEATURES - Correct paths
const WeatherAlerts = lazy(() => import('@/pages/features/WeatherAlerts'));
const DiseaseDetection = lazy(() => import('@/pages/features/DiseaseDetection'));
const AIChatbot = lazy(() => import('@/pages/features/AIChatbot'));
const GovernmentSchemes = lazy(() => import('@/pages/features/GovernmentSchemes'));
const SoilHealth = lazy(() => import('@/pages/features/SoilHealth'));
const B2BMarketplace = lazy(() => import('@/pages/features/B2BMarketplace')); // ✅ CORRECT PATH
const CropRecommendations = lazy(() => import('@/pages/features/CropRecommendations'));

// Profile pages
const Profile = lazy(() => import('@/pages/profile/Profile'));
const EditProfile = lazy(() => import('@/pages/profile/EditProfile'));
const Settings = lazy(() => import('@/pages/profile/Settings'));

// ✅ FEEDBACK PAGE WRAPPER - Create a page wrapper for the form
const FeedbackPage = () => {
  return (
    <div className="container mx-auto py-8">
      <FeedbackForm onSubmitSuccess={(result) => {
        console.log('Feedback submitted:', result);
        // Handle success - maybe show toast or redirect
      }} />
    </div>
  );
};

const router = createBrowserRouter([
  // ✅ PUBLIC ROUTES
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
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
      // ✅ FEEDBACK - Using the form component wrapped in a page
      {
        path: 'feedback',
        element: <FeedbackPage />
      },
      // Public market prices preview
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
  
  // ✅ AUTH ROUTES
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout><Login /></AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout><Register /></AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <AuthLayout><ForgotPassword /></AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/verify-otp',
    element: (
      <PublicRoute>
        <AuthLayout><VerifyOTP /></AuthLayout>
      </PublicRoute>
    )
  },

  // ✅ DASHBOARD ROUTES
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
    element: <MainLayout />, // ✅ REMOVED ProtectedRoute - Make public
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
    element: <MainLayout />, // ✅ REMOVED ProtectedRoute - Make public
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
    children: [
      {
        index: true,
        element: <SoilHealth />
      }
    ]
  },

  // ✅ B2B MARKETPLACE - Correct path from features folder
  {
    path: '/marketplace',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <B2BMarketplace /> // ✅ This now points to the correct file
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
    children: [
      {
        index: true,
        element: <Settings />
      }
    ]
  },

  // ✅ CATCH ALL - 404
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
