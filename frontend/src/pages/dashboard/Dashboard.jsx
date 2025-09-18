// src/pages/dashboard/Dashboard.jsx - SIMPLE FALLBACK
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {currentLanguage === 'hi' ? 'आपका स्मार्ट कृषि नियंत्रण केंद्र' : 'Your Smart Agriculture Control Center'}
          </p>
        </div>

        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {currentLanguage === 'hi' ? 'स्वागत है' : 'Welcome'}, {user.name}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{user.role}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'hi' ? 'भूमिका' : 'Role'}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user.email?.substring(0, 20)}...
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'hi' ? 'ईमेल' : 'Email'}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">✅</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'hi' ? 'सत्यापित' : 'Verified'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-2">🌱</div>
            <h3 className="font-semibold text-lg mb-2">
              {currentLanguage === 'hi' ? 'फसल प्रबंधन' : 'Crop Management'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {currentLanguage === 'hi' ? 'अपनी फसलों की निगरानी करें' : 'Monitor your crops'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-2">🌤️</div>
            <h3 className="font-semibold text-lg mb-2">
              {currentLanguage === 'hi' ? 'मौसम की जानकारी' : 'Weather Updates'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {currentLanguage === 'hi' ? 'वर्तमान मौसम की स्थिति' : 'Current weather conditions'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-lg mb-2">
              {currentLanguage === 'hi' ? 'बाजार की कीमतें' : 'Market Prices'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {currentLanguage === 'hi' ? 'आज के बाजार भाव' : "Today's market rates"}
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400">
            {currentLanguage === 'hi' ? 
              '🎉 बधाई हो! आपका खाता सफलतापूर्वक बनाया गया है।' : 
              '🎉 Congratulations! Your account has been created successfully.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
