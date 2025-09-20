// src/components/layout/Footer.jsx - BEAUTIFUL DESIGN & PROPER ALIGNMENT
import React from 'react';
import { Link } from 'react-router-dom';
import { Wheat, Heart, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-6 py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Emotional Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wheat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">कृषि सहायक</h2>
                <p className="text-yellow-300 text-sm font-medium">Smart Farming Companion</p>
              </div>
            </div>
            
            {/* Emotional Message - Crystal Clear */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-amber-900 font-bold text-lg">
                  {currentLanguage === 'hi' ? 'अन्नदाताओं के लिए' : 'For Our Annadatas'}
                </span>
              </div>
              <p className="text-amber-800 font-medium leading-relaxed">
                {currentLanguage === 'hi' 
                  ? 'आपकी मेहनत से भरे खेत, हमारी तकनीक का साथ - मिलकर बनाएंगे समृद्ध भारत'
                  : 'Your hardworking fields with our technology - together building prosperous India'
                }
              </p>
            </div>

            {!user && (
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Wheat className="h-5 w-5" />
                {currentLanguage === 'hi' ? 'आज ही शुरू करें' : 'Start Today'}
              </Link>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-5">
              {currentLanguage === 'hi' ? 'स्मार्ट खेती' : 'Smart Farming'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/crops" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium flex items-center gap-2">
                  <span className="text-green-400">🌱</span>
                  {currentLanguage === 'hi' ? 'फसल प्रबंधन' : 'Crop Management'}
                </Link>
              </li>
              <li>
                <Link to="/market-prices" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium flex items-center gap-2">
                  <span className="text-yellow-400">💰</span>
                  {currentLanguage === 'hi' ? 'बाजार के भाव' : 'Market Prices'}
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium flex items-center gap-2">
                  <span className="text-blue-400">🌤️</span>
                  {currentLanguage === 'hi' ? 'मौसम की जानकारी' : 'Weather Updates'}
                </Link>
              </li>
              <li>
                <Link to="/ai-chat" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium flex items-center gap-2">
                  <span className="text-purple-400">🤖</span>
                  {currentLanguage === 'hi' ? 'AI सलाहकार' : 'AI Advisor'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-xl font-bold text-white mb-5">
              {currentLanguage === 'hi' ? 'संपर्क और सहायता' : 'Contact & Support'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">24/7 किसान हेल्पलाइन</p>
                  <p className="text-yellow-300 font-bold hover:text-yellow-300 transition-colors">1800-KRISHI-1</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">ईमेल सपोर्ट</p>
                  <p className="text-yellow-300 font-bold hover:text-yellow-300 transition-colors">help@krishisahayak.in</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">भारत से सेवा</p>
                  <p className="text-yellow-300 font-bold hover:text-yellow-300 transition-colors">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patriotic Section - Crystal Clear */}
        <div className="border-t-2 border-yellow-500 pt-6 mb-6">
          <div className="bg-gradient-to-r from-orange-100 via-white to-green-100 p-6 rounded-xl border-2 border-yellow-400">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-4xl">🇮🇳</span>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-orange-600 mb-2">
                  {currentLanguage === 'hi' ? '"जय जवान, जय किसान"' : '"Jai Jawan, Jai Kisan"'}
                </h3>
                <p className="text-lg font-semibold text-green-700">
                  {currentLanguage === 'hi' 
                    ? 'भारतीय किसानों के गौरव में बनाया गया'
                    : 'Built with Pride for Indian Farmers'
                  }
                </p>
              </div>
              <span className="text-4xl">🚜</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-white font-semibold text-lg">
                © {currentYear} कृषि सहायक (Krishi Sahayak)
              </p>
              <p className="text-yellow-300 font-medium">
                {currentLanguage === 'hi' ? 'सभी अधिकार सुरक्षित' : 'All Rights Reserved'}
              </p>
            </div>
            
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium">
                {currentLanguage === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-yellow-300 transition-colors font-medium">
                {currentLanguage === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
