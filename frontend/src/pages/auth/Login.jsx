// src/pages/auth/Login.jsx - SMALLER BEAUTIFUL AGRICULTURAL BACKGROUND
import React from 'react';
import LoginForm from '@/components/forms/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-emerald-50 via-teal-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:via-teal-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-teal-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-300/20 to-green-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Agricultural Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Row 1 */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🌾</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🚜</div>
        <div className="absolute top-32 left-1/3 text-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🌱</div>
        
        {/* Row 2 */}
        <div className="absolute top-1/2 left-16 text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.2s' }}>☀️</div>
        <div className="absolute top-1/2 right-16 text-3xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }}>🌧️</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}>🌽</div>
        
        {/* Row 3 */}
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3.6s' }}>🌿</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-bounce" style={{ animationDelay: '1.8s', animationDuration: '3.4s' }}>🌻</div>
        <div className="absolute bottom-32 right-1/3 text-4xl animate-bounce" style={{ animationDelay: '2.8s', animationDuration: '4s' }}>🌳</div>
        
        {/* Additional elements */}
        <div className="absolute top-1/4 right-1/4 text-2xl animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '3.7s' }}>🍃</div>
        <div className="absolute bottom-1/4 left-1/4 text-2xl animate-bounce" style={{ animationDelay: '2.2s', animationDuration: '3.9s' }}>🌺</div>
      </div>

      {/* Weather-themed Floating Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/8 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/8 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main Content - Smaller Container */}
      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>

      {/* Bottom Agricultural Info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
        <div className="bg-green-100/80 dark:bg-green-900/40 backdrop-blur-sm rounded-full px-6 py-2 border border-green-200/50 dark:border-green-700/50">
          {/* <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <span>🌾</span>
            <span>Smart Farming • Weather Alerts • AI Advisory</span>
            <span>🇮🇳</span>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
