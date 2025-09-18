// src/pages/auth/VerifyOTP.jsx - UPDATED WITH ROLE-BASED REDIRECT
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();
  const { currentLanguage } = useLanguage();

  // Get user data from navigation state
  const userData = location.state;
  const userEmail = userData?.email || '';
  const userName = userData?.name || '';
  const userRole = userData?.role || 'farmer'; // ✅ Get role from registration data

  console.log('🔐 VerifyOTP: Component loaded');
  console.log('🔐 VerifyOTP: User data =', userData);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no user data
  useEffect(() => {
    if (!userData || !userEmail) {
      console.log('🔐 VerifyOTP: No user data, redirecting to register');
      navigate('/register');
    }
  }, [userData, userEmail, navigate]);

  // ✅ ROLE-BASED NAVIGATION FUNCTION
  const getRedirectPath = (verifiedUser) => {
    const role = verifiedUser?.role || userRole;
    console.log('🎯 VerifyOTP: User role =', role);
    
    switch (role) {
      case 'farmer':
        return '/dashboard/farmer';  // ✅ Redirect to FarmerDashboard
      case 'buyer':
        return '/dashboard/buyer';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';  // ✅ Fallback to generic dashboard
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 VerifyOTP: Verifying OTP =', otp);
      
      const result = await verifyOTP({
        email: userEmail,
        otp: otp
      });

      console.log('🔐 VerifyOTP: Verification result =', result);

      if (result.success) {
        // ✅ REDIRECT BASED ON ROLE
        const redirectPath = getRedirectPath(result.user);
        console.log('🎯 VerifyOTP: Redirecting to =', redirectPath);
        
        navigate(redirectPath);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error) {
      console.error('🔐 VerifyOTP: Error =', error);
      setError(error.message || 'OTP verification failed');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!userData || !userEmail) {
    return (
      <div className="text-center">
        <p>Redirecting to registration...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLanguage === 'hi' ? 'OTP सत्यापन' : 'Verify OTP'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
          {currentLanguage === 'hi' ? 'OTP भेजा गया है' : 'OTP sent to'}: <br />
          <span className="font-medium text-emerald-600">{userEmail}</span>
        </p>
        {userName && (
          <p className="text-sm text-gray-500 mt-1">
            {currentLanguage === 'hi' ? 'स्वागत है' : 'Welcome'}, {userName}!
          </p>
        )}
        {/* ✅ Show role-specific redirect info */}
        <p className="text-xs text-blue-600 mt-2">
          {userRole === 'farmer' && '👨‍🌾 Will redirect to Farmer Dashboard'}
          {userRole === 'buyer' && '🛒 Will redirect to Buyer Dashboard'}
          {userRole === 'admin' && '👑 Will redirect to Admin Dashboard'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {currentLanguage === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'} *
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {currentLanguage === 'hi' ? '6-अंकों का OTP दर्ज करें' : 'Enter 6-digit OTP'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-6 rounded-md hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentLanguage === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...'}
              </>
            ) : (
              currentLanguage === 'hi' ? 'सत्यापित करें और जारी रखें' : 'Verify & Continue'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              disabled={countdown > 0}
              onClick={() => setCountdown(60)}
              className="text-sm text-emerald-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {countdown > 0 ? (
                currentLanguage === 'hi' ? 
                  `${formatTime(countdown)} में दोबारा भेजें` : 
                  `Resend in ${formatTime(countdown)}`
              ) : (
                currentLanguage === 'hi' ? 'OTP दोबारा भेजें' : 'Resend OTP'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-gray-600 hover:underline"
            >
              {currentLanguage === 'hi' ? '← वापस रजिस्ट्रेशन पर जाएं' : '← Back to Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
