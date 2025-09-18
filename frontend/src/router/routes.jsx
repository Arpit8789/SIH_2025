// src/router/routes.js - COMPLETE FIXED VERSION
import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// ✅ DIRECT IMPORTS for problematic components (to avoid lazy loading issues)
import Register from '@/pages/auth/Register';
import VerifyOTP from '@/pages/auth/VerifyOTP'; // ✅ Direct import to avoid issues

// Lazy load other pages
const Landing = lazy(() => import('@/pages/Landing'));
const Home = lazy(() => import('@/pages/common/Home'));
const About = lazy(() => import('@/pages/common/About'));
const Contact = lazy(() => import('@/pages/common/Contact'));
const Help = lazy(() => import('@/pages/common/Help'));
const NotFound = lazy(() => import('@/pages/common/NotFound'));
const Feedback = lazy(() => import('@/pages/common/Feedback'));

// Auth pages (lazy load the working ones)
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
// ✅ REMOVED: const VerifyOTP = lazy(() => import('@/pages/auth/VerifyOTP')); // This was causing duplicate declaration

// Dashboard pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const FarmerDashboard = lazy(() => import('@/pages/dashboard/FarmerDashboard'));
const BuyerDashboard = lazy(() => import('@/pages/dashboard/BuyerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));

// Feature pages
const MarketPrices = lazy(() => import('@/pages/features/MarketPrices'));
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

const router = createBrowserRouter([
  // ✅ Public routes with MainLayout
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
      {
        path: 'feedback',
        element: <Feedback />
      },
      {
        path: 'demo',
        element: <Landing />
      },
      // Public feature previews
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

  // ✅ FIXED Auth Routes - Using Direct Imports
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Register />
        </AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/verify-otp',
    element: (
      <PublicRoute>
        <AuthLayout>
          <VerifyOTP />
        </AuthLayout>
      </PublicRoute>
    )
  },

  // ✅ Protected dashboard routes
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

  // ✅ Protected feature routes
  {
    path: '/features',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'disease-detection',
        element: (
          <ProtectedRoute requiredRole="farmer">
            <DiseaseDetection />
          </ProtectedRoute>
        )
      },
      {
        path: 'ai-chat',
        element: <AIChatbot />
      },
      {
        path: 'schemes',
        element: (
          <ProtectedRoute requiredRole="farmer">
            <GovernmentSchemes />
          </ProtectedRoute>
        )
      },
      {
        path: 'soil-health',
        element: (
          <ProtectedRoute requiredRole="farmer">
            <SoilHealth />
          </ProtectedRoute>
        )
      },
      {
        path: 'marketplace',
        element: <B2BMarketplace />
      },
      {
        path: 'crop-recommendations',
        element: (
          <ProtectedRoute requiredRole="farmer">
            <CropRecommendations />
          </ProtectedRoute>
        )
      },
      {
        path: 'market-analysis',
        element: <MarketPrices />
      },
      {
        path: 'weather-forecast',
        element: <WeatherAlerts />
      }
    ]
  },

  // ✅ Protected profile routes
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
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },

  // ✅ Catch all - 404
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
