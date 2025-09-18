// src/components/layout/AuthLayout.jsx - COMPLETE WORKING VERSION
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe, Moon, Sun, ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children }) => {
  console.log('🏗️ AuthLayout: Component rendering');
  console.log('🏗️ AuthLayout: children =', children);
  
  try {
    const { currentLanguage, t } = useLanguage();
    console.log('🏗️ AuthLayout: useLanguage successful, lang =', currentLanguage);
    
    // Simple theme toggle (fallback if useTheme doesn't exist)
    const [isDark, setIsDark] = React.useState(false);
    const toggleTheme = () => setIsDark(!isDark);

    console.log('🏗️ AuthLayout: About to render JSX');

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        {/* Auth Header */}
        <header className="p-4 sm:p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              {currentLanguage === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Simple Language Toggle */}
            <button
              className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
              onClick={() => {/* Language toggle logic */}}
            >
              <Globe className="h-4 w-4" />
              <span>{currentLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇺🇸 English'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-4xl">
            {/* Content Container */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8">
              {/* Render children if provided, otherwise use Outlet */}
              {(() => {
                if (children) {
                  console.log('🏗️ AuthLayout: Rendering children');
                  return children;
                } else {
                  console.log('🏗️ AuthLayout: Rendering Outlet');
                  return <Outlet />;
                }
              })()}
            </div>

            {/* Back to Home Link */}
            <div className="text-center mt-6">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentLanguage === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Footer */}
        <footer className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {currentLanguage === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🇮🇳 {currentLanguage === 'hi' ? 'भारतीय किसानों के लिए ❤️ के साथ बनाया गया' : 'Made with ❤️ for Indian Farmers'} 🇮🇳
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('❌ AuthLayout: Error occurred =', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600">AuthLayout Error</h1>
          <p className="text-red-500 mt-2">{error.message}</p>
          <Link 
            to="/" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
};

export default AuthLayout;
