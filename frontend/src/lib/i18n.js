// src/lib/i18n.js - COMPLETE
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources
const resources = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      download: 'Download',
      upload: 'Upload',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      allStates: 'All States',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total'
    },
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      logout: 'Logout',
      login: 'Login',
      register: 'Register'
    },
    auth: {
      welcome: 'Welcome to Krishi Sahayak',
      loginTitle: 'Sign in to your account',
      registerTitle: 'Create your account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      orContinueWith: 'Or continue with',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signInHere: 'Sign in here',
      signUpHere: 'Sign up here'
    },
    agriculture: {
      farming: 'Farming',
      crops: 'Crops',
      weather: 'Weather',
      market: 'Market',
      prices: 'Prices',
      alerts: 'Alerts',
      recommendations: 'Recommendations',
      analysis: 'Analysis',
      reports: 'Reports',
      statistics: 'Statistics'
    }
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      submit: 'जमा करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      search: 'खोजें',
      filter: 'फिल्टर',
      sort: 'क्रमबद्ध करें',
      refresh: 'रीफ्रेश करें',
      download: 'डाउनलोड करें',
      upload: 'अपलोड करें',
      close: 'बंद करें',
      open: 'खोलें',
      yes: 'हां',
      no: 'नहीं',
      ok: 'ठीक',
      allStates: 'सभी राज्य',
      date: 'तारीख',
      time: 'समय',
      location: 'स्थान',
      price: 'मूल्य',
      quantity: 'मात्रा',
      total: 'कुल'
    },
    navigation: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      help: 'मदद',
      about: 'हमारे बारे में',
      contact: 'संपर्क',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      register: 'रजिस्टर करें'
    },
    auth: {
      welcome: 'कृषि सहायक में आपका स्वागत है',
      loginTitle: 'अपने खाते में साइन इन करें',
      registerTitle: 'अपना खाता बनाएं',
      email: 'ईमेल',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      loginButton: 'साइन इन करें',
      registerButton: 'खाता बनाएं',
      orContinueWith: 'या जारी रखें',
      alreadyHaveAccount: 'पहले से खाता है?',
      dontHaveAccount: 'खाता नहीं है?',
      signInHere: 'यहां साइन इन करें',
      signUpHere: 'यहां साइन अप करें'
    },
    agriculture: {
      farming: 'खेती',
      crops: 'फसलें',
      weather: 'मौसम',
      market: 'बाजार',
      prices: 'मूल्य',
      alerts: 'अलर्ट',
      recommendations: 'सिफारिशें',
      analysis: 'विश्लेषण',
      reports: 'रिपोर्ट',
      statistics: 'आंकड़े'
    }
  },
  pa: {
    common: {
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      error: 'ਗਲਤੀ',
      success: 'ਸਫਲਤਾ',
      save: 'ਸੇਵ ਕਰੋ',
      cancel: 'ਰੱਦ ਕਰੋ',
      submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
      delete: 'ਮਿਟਾਓ',
      edit: 'ਸੰਪਾਦਿਤ ਕਰੋ',
      view: 'ਦੇਖੋ',
      back: 'ਵਾਪਸ',
      next: 'ਅਗਲਾ',
      previous: 'ਪਿਛਲਾ',
      search: 'ਖੋਜੋ',
      filter: 'ਫਿਲਟਰ',
      sort: 'ਕ੍ਰਮ',
      refresh: 'ਰੀਫ੍ਰੈਸ਼',
      download: 'ਡਾਊਨਲੋਡ',
      upload: 'ਅਪਲੋਡ',
      close: 'ਬੰਦ',
      open: 'ਖੋਲ੍ਹੋ',
      yes: 'ਹਾਂ',
      no: 'ਨਹੀਂ',
      ok: 'ਠੀਕ',
      allStates: 'ਸਾਰੇ ਰਾਜ',
      date: 'ਮਿਤੀ',
      time: 'ਸਮਾਂ',
      location: 'ਸਥਾਨ',
      price: 'ਕੀਮਤ',
      quantity: 'ਮਾਤਰਾ',
      total: 'ਕੁੱਲ'
    },
    navigation: {
      home: 'ਘਰ',
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      profile: 'ਪ੍ਰੋਫਾਈਲ',
      settings: 'ਸੈਟਿੰਗਾਂ',
      help: 'ਮਦਦ',
      about: 'ਸਾਡੇ ਬਾਰੇ',
      contact: 'ਸੰਪਰਕ',
      logout: 'ਲਾਗਆਊਟ',
      login: 'ਲਾਗਇਨ',
      register: 'ਰਜਿਸਟਰ'
    },
    auth: {
      welcome: 'ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
      loginTitle: 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ',
      registerTitle: 'ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ',
      email: 'ਈਮੇਲ',
      password: 'ਪਾਸਵਰਡ',
      confirmPassword: 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      forgotPassword: 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
      loginButton: 'ਸਾਈਨ ਇਨ ਕਰੋ',
      registerButton: 'ਖਾਤਾ ਬਣਾਓ',
      orContinueWith: 'ਜਾਂ ਜਾਰੀ ਰੱਖੋ',
      alreadyHaveAccount: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',
      dontHaveAccount: 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
      signInHere: 'ਇੱਥੇ ਸਾਈਨ ਇਨ ਕਰੋ',
      signUpHere: 'ਇੱਥੇ ਸਾਈਨ ਅਪ ਕਰੋ'
    },
    agriculture: {
      farming: 'ਖੇਤੀਬਾੜੀ',
      crops: 'ਫਸਲਾਂ',
      weather: 'ਮੌਸਮ',
      market: 'ਮਾਰਕੀਟ',
      prices: 'ਕੀਮਤਾਂ',
      alerts: 'ਚੇਤਾਵਨੀਆਂ',
      recommendations: 'ਸਿਫਾਰਸ਼ਾਂ',
      analysis: 'ਵਿਸ਼ਲੇਸ਼ਣ',
      reports: 'ਰਿਪੋਰਟਾਂ',
      statistics: 'ਅੰਕੜੇ'
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    
    debug: import.meta.env.DEV,
    
    react: {
      useSuspense: false
    }
  })

export default i18n
