// src/hooks/useLanguage.js - PURE JS VERSION (NO JSX)
import { useState, useEffect, createContext, useContext } from 'react';

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('krishi-language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Default to Hindi for Indian users
      const userLang = navigator.language || navigator.userLanguage;
      if (userLang.startsWith('hi')) {
        setCurrentLanguage('hi');
      }
    }
  }, []);

  // Save language to localStorage when changed
  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('krishi-language', lang);
    
    // Optional: Also set HTML lang attribute
    document.documentElement.lang = lang;
  };

  // Simple translation function
  const t = (key, fallback = key) => {
    const translations = {
      en: {
        'welcome': 'Welcome',
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'settings': 'Settings',
        'logout': 'Logout',
        'search': 'Search crops, weather, prices...',
        'voice_listening': 'Listening...',
        'voice_error': 'Voice recognition error',
        'voice_not_supported': 'Voice recognition not supported'
      },
      hi: {
        'welcome': 'स्वागत',
        'dashboard': 'डैशबोर्ड',
        'profile': 'प्रोफाइल',
        'settings': 'सेटिंग्स',
        'logout': 'लॉग आउट',
        'search': 'फसल, मौसम, भाव खोजें...',
        'voice_listening': 'सुन रहा है...',
        'voice_error': 'आवाज पहचान में त्रुटि',
        'voice_not_supported': 'आवाज पहचान समर्थित नहीं'
      },
      pa: {
        'welcome': 'ਸਵਾਗਤ',
        'dashboard': 'ਡੈਸ਼ਬੋਰਡ',
        'profile': 'ਪ੍ਰੋਫਾਈਲ',
        'settings': 'ਸੈਟਿੰਗਜ਼',
        'logout': 'ਲੌਗ ਆਊਟ',
        'search': 'ਫਸਲਾਂ, ਮੌਸਮ, ਕੀਮਤਾਂ ਖੋਜੋ...',
        'voice_listening': 'ਸੁਣ ਰਿਹਾ ਹੈ...',
        'voice_error': 'ਆਵਾਜ਼ ਪਛਾਣ ਵਿੱਚ ਗਲਤੀ',
        'voice_not_supported': 'ਆਵਾਜ਼ ਪਛਾਣ ਸਮਰਥਿਤ ਨਹੀਂ'
      }
    };

    return translations[currentLanguage]?.[key] || fallback;
  };

  // Get language-specific voice recognition language code
  const getVoiceLanguage = () => {
    const langCodes = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'pa': 'pa-IN'
    };
    return langCodes[currentLanguage] || 'en-US';
  };

  // Get supported languages list
  const getSupportedLanguages = () => {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
    ];
  };

  // Check if current language is RTL
  const isRTL = () => {
    return false;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getVoiceLanguage,
    getSupportedLanguages,
    isRTL
  };

  return React.createElement(LanguageContext.Provider, { value }, children);
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Fallback implementation if provider is not found
    console.warn('useLanguage must be used within LanguageProvider. Using fallback.');
    return {
      currentLanguage: 'en',
      changeLanguage: () => {},
      t: (key, fallback = key) => fallback,
      getVoiceLanguage: () => 'en-US',
      getSupportedLanguages: () => [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
      ],
      isRTL: () => false
    };
  }
  
  return context;
};

// Export default for direct import
export default useLanguage;
