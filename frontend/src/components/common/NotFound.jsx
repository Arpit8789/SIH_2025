// src/pages/common/NotFound.jsx - ULTRA BEAUTIFUL KRISHI SAHAYAK 404 PAGE
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Crop Icons */}
        <div className={`absolute top-20 left-10 text-4xl opacity-20 transform transition-all duration-1000 ${mounted ? 'translate-y-0 rotate-12' : 'translate-y-10 rotate-0'}`}>🌾</div>
        <div className={`absolute top-32 right-16 text-5xl opacity-15 transform transition-all duration-1500 ${mounted ? 'translate-y-0 -rotate-12' : 'translate-y-10 rotate-0'}`}>🚜</div>
        <div className={`absolute bottom-32 left-20 text-6xl opacity-10 transform transition-all duration-2000 ${mounted ? 'translate-y-0 rotate-45' : 'translate-y-10 rotate-0'}`}>🌽</div>
        <div className={`absolute bottom-20 right-10 text-4xl opacity-20 transform transition-all duration-1200 ${mounted ? 'translate-y-0 -rotate-45' : 'translate-y-10 rotate-0'}`}>🌱</div>
        <div className={`absolute top-1/2 left-1/4 text-3xl opacity-15 transform transition-all duration-1800 ${mounted ? 'translate-y-0 rotate-90' : 'translate-y-10 rotate-0'}`}>☀️</div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-teal-200/40 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-center max-w-2xl mx-auto">
          {/* Main Agricultural Icon with Animation */}
          <div className="relative mb-8">
            <div className={`text-9xl md:text-[12rem] transform transition-all duration-1000 ${mounted ? 'scale-100 rotate-12' : 'scale-75 rotate-0'}`}>
              🌾
            </div>
            <div className="absolute -top-4 -right-8 text-3xl opacity-80 animate-bounce animation-delay-500">💧</div>
            <div className="absolute -bottom-4 -left-6 text-4xl opacity-70 animate-pulse animation-delay-1000">🌱</div>
          </div>

          {/* Error Code with Gradient */}
          <div className={`transform transition-all duration-1200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-8xl md:text-9xl font-black mb-4 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
              404
            </h1>
          </div>

          {/* Error Title */}
          <div className={`transform transition-all duration-1400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
              Field Not Found
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6"></div>
          </div>

          {/* Description with Agricultural Theme */}
          <div className={`transform transition-all duration-1600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Oops! Looks like this field hasn't been cultivated yet. 
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
              The page you're looking for might have been moved, deleted, or is currently being planted with new content.
            </p>
          </div>

          {/* Action Buttons with Beautiful Design */}
          <div className={`transform transition-all duration-1800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/" 
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="relative z-10">Return to Farm</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
              </Link>
              
              <button 
                onClick={handleGoBack}
                className="group inline-flex items-center justify-center px-8 py-4 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-2xl font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className={`transform transition-all duration-2000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Link to="/dashboard" className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🌾</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your farming command center</p>
              </Link>
              
              <Link to="/market-prices" className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Market Prices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time crop prices</p>
              </Link>
              
              <Link to="/weather" className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🌤️</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Weather</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agricultural forecasts</p>
              </Link>
            </div>
          </div>

          {/* Brand Message */}
          <div className={`transform transition-all duration-2200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="mt-12 p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="text-2xl mr-2">🌱</div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Krishi Sahayak
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 font-medium">
                Empowering Indian farmers with AI-powered agricultural solutions
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                🌾 Crop Guidance • 🌤️ Weather Alerts • 💰 Market Intelligence • 🔬 Disease Detection
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`transform transition-all duration-2400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              Need help? Our AI assistant is always ready to guide you! 🤖
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
