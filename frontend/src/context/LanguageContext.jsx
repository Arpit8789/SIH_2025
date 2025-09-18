// src/context/LanguageContext.jsx - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react'

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    rtl: false,
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    rtl: false,
  },
}

// ✅ COMPLETE TRANSLATIONS (All missing keys added)
const TRANSLATIONS = {
  en: {
    app: {
      name: 'Krishi Sahayak'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      menu: 'Menu',
      search: 'Search',
      searchPlaceholder: 'Search crops, weather, prices...',
      notifications: 'Notifications',
      profile: 'Profile',
      toggleTheme: 'Toggle theme',
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      backToHome: 'Back to Home',
      and: 'and'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      createAccount: 'Create Account',
      registerSubtitle: 'Join thousands of farmers using smart agriculture',
      fullName: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      phone: 'Phone Number',
      password: 'Password',
      passwordPlaceholder: 'Create a strong password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      role: 'I am a',
      selectRole: 'Select your role',
      state: 'State',
      selectState: 'Select your state',
      district: 'District',
      districtPlaceholder: 'Enter your district',
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      haveAccount: 'Already have an account?',
      registrationFailed: 'Registration failed. Please try again.'
    },
    roles: {
      farmer: 'Farmer',
      buyer: 'Buyer',
      admin: 'Admin'
    },
    footer: {
      allRightsReserved: 'All rights reserved',
      madeInIndia: 'Made with ❤️ for Indian Farmers'
    }
  },
  hi: {
    app: {
      name: 'कृषि सहायक'
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      menu: 'मेनू',
      search: 'खोजें',
      searchPlaceholder: 'फसल, मौसम, कीमत खोजें...',
      notifications: 'सूचनाएं',
      profile: 'प्रोफाइल',
      toggleTheme: 'थीम बदलें',
      goodMorning: 'सुप्रभात',
      goodAfternoon: 'नमस्कार',
      goodEvening: 'शुभ संध्या',
      backToHome: 'होम पर वापस जाएं',
      and: 'और'
    },
    auth: {
      login: 'लॉगिन',
      register: 'रजिस्टर करें',
      logout: 'लॉगआउट',
      createAccount: 'खाता बनाएं',
      registerSubtitle: 'हजारों किसानों के साथ स्मार्ट खेती में शामिल हों',
      fullName: 'पूरा नाम',
      namePlaceholder: 'अपना पूरा नाम दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
      phone: 'फ़ोन नंबर',
      password: 'पासवर्ड',
      passwordPlaceholder: 'एक मजबूत पासवर्ड बनाएं',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      confirmPasswordPlaceholder: 'अपने पासवर्ड की पुष्टि करें',
      role: 'मैं हूं',
      selectRole: 'अपनी भूमिका चुनें',
      state: 'राज्य',
      selectState: 'अपना राज्य चुनें',
      district: 'जिला',
      districtPlaceholder: 'अपना जिला दर्ज करें',
      agreeToTerms: 'मैं सहमत हूं',
      termsOfService: 'सेवा की शर्तें',
      privacyPolicy: 'गोपनीयता नीति',
      haveAccount: 'पहले से खाता है?',
      registrationFailed: 'पंजीकरण असफल। कृपया पुनः प्रयास करें।'
    },
    roles: {
      farmer: 'किसान',
      buyer: 'खरीदार',
      admin: 'एडमिन'
    },
    footer: {
      allRightsReserved: 'सभी अधिकार सुरक्षित',
      madeInIndia: 'भारतीय किसानों के लिए ❤️ के साथ बनाया गया'
    }
  },
  pa: {
    app: {
      name: 'ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ'
    },
    common: {
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      error: 'ਗਲਤੀ',
      success: 'ਸਫਲਤਾ',
      menu: 'ਮੀਨੂ',
      search: 'ਖੋਜੋ',
      searchPlaceholder: 'ਫਸਲਾਂ, ਮੌਸਮ, ਕੀਮਤਾਂ ਖੋਜੋ...',
      notifications: 'ਸੂਚਨਾਵਾਂ',
      profile: 'ਪ੍ਰੋਫਾਈਲ',
      toggleTheme: 'ਥੀਮ ਬਦਲੋ',
      goodMorning: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      goodAfternoon: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      goodEvening: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
      backToHome: 'ਘਰ ਵਾਪਸ ਜਾਓ',
      and: 'ਅਤੇ'
    },
    auth: {
      login: 'ਲਾਗਇਨ',
      register: 'ਰਜਿਸਟਰ ਕਰੋ',
      logout: 'ਲਾਗਆਊਟ',
      createAccount: 'ਖਾਤਾ ਬਣਾਓ',
      registerSubtitle: 'ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਵਿੱਚ ਹਜ਼ਾਰਾਂ ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ',
      fullName: 'ਪੂਰਾ ਨਾਮ',
      namePlaceholder: 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      email: 'ਈਮੇਲ ਪਤਾ',
      emailPlaceholder: 'ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ',
      phone: 'ਫ਼ੋਨ ਨੰਬਰ',
      password: 'ਪਾਸਵਰਡ',
      passwordPlaceholder: 'ਇੱਕ ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਬਣਾਓ',
      confirmPassword: 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      confirmPasswordPlaceholder: 'ਆਪਣੇ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      role: 'ਮੈਂ ਹਾਂ',
      selectRole: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
      state: 'ਰਾਜ',
      selectState: 'ਆਪਣਾ ਰਾਜ ਚੁਣੋ',
      district: 'ਜ਼ਿਲ੍ਹਾ',
      districtPlaceholder: 'ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਦਰਜ ਕਰੋ',
      agreeToTerms: 'ਮੈਂ ਸਹਿਮਤ ਹਾਂ',
      termsOfService: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ',
      privacyPolicy: 'ਗੁਪਤਤਾ ਨੀਤੀ',
      haveAccount: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',
      registrationFailed: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।'
    },
    roles: {
      farmer: 'ਕਿਸਾਨ',
      buyer: 'ਖਰੀਦਦਾਰ',
      admin: 'ਐਡਮਿਨ'
    },
    footer: {
      allRightsReserved: 'ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ',
      madeInIndia: 'ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ❤️ ਨਾਲ ਬਣਾਇਆ ਗਿਆ'
    }
  }
}

// Default language
const DEFAULT_LANGUAGE = 'hi' // Default to Hindi for Indian farmers

// Create Language Context
const LanguageContext = createContext(null)

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize language on app load
  useEffect(() => {
    initializeLanguage()
  }, [])

  const initializeLanguage = () => {
    try {
      // Get saved language from localStorage or browser
      const savedLanguage = localStorage.getItem('language')
      const browserLanguage = navigator.language?.split('-')[0]
      
      // Determine initial language
      let initialLanguage = DEFAULT_LANGUAGE
      
      if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
        initialLanguage = savedLanguage
      } else if (browserLanguage && SUPPORTED_LANGUAGES[browserLanguage]) {
        initialLanguage = browserLanguage
      }

      setCurrentLanguage(initialLanguage)
      
      // Update document attributes
      document.documentElement.lang = initialLanguage
      document.documentElement.dir = SUPPORTED_LANGUAGES[initialLanguage].rtl ? 'rtl' : 'ltr'
    } catch (error) {
      console.error('Language initialization error:', error)
      setCurrentLanguage(DEFAULT_LANGUAGE)
    }
  }

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      console.error(`Language ${languageCode} is not supported`)
      return false
    }

    if (languageCode === currentLanguage) {
      return true // Already selected
    }

    try {
      setIsLoading(true)
      
      // Save to localStorage
      localStorage.setItem('language', languageCode)
      
      // Update current language
      setCurrentLanguage(languageCode)
      
      // Update document language
      document.documentElement.lang = languageCode
      
      // Update document direction for RTL languages
      document.documentElement.dir = SUPPORTED_LANGUAGES[languageCode].rtl ? 'rtl' : 'ltr'
      
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Language change error:', error)
      setIsLoading(false)
      return false
    }
  }

  // Translation function
  const t = (key, params = {}) => {
    try {
      // Get current translations
      const translations = TRANSLATIONS[currentLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE]
      
      // Split key by dots to support nested keys (e.g., 'auth.login')
      const keys = key.split('.')
      let translation = translations

      // Navigate through nested object
      for (const k of keys) {
        if (translation && typeof translation === 'object' && translation[k] !== undefined) {
          translation = translation[k]
        } else {
          // Try fallback language
          if (currentLanguage !== DEFAULT_LANGUAGE) {
            const fallbackTranslations = TRANSLATIONS[DEFAULT_LANGUAGE]
            let fallbackTranslation = fallbackTranslations
            
            for (const k of keys) {
              if (fallbackTranslation && typeof fallbackTranslation === 'object' && fallbackTranslation[k] !== undefined) {
                fallbackTranslation = fallbackTranslation[k]
              } else {
                return params.defaultValue || key
              }
            }
            
            return typeof fallbackTranslation === 'string' ? fallbackTranslation : (params.defaultValue || key)
          }
          
          return params.defaultValue || key
        }
      }

      // If translation is still an object, return the key
      if (typeof translation !== 'string') {
        return params.defaultValue || key
      }

      // Replace parameters in translation
      let result = translation
      Object.entries(params).forEach(([param, value]) => {
        if (param !== 'defaultValue') {
          result = result.replace(new RegExp(`{{${param}}}`, 'g'), value)
        }
      })

      return result
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error)
      return params.defaultValue || key
    }
  }

  // Get current language info
  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE]
  }

  // Check if language is RTL
  const isRTL = () => {
    return getCurrentLanguage().rtl
  }

  // Get available languages as array
  const getAvailableLanguages = () => {
    return Object.values(SUPPORTED_LANGUAGES)
  }

  // Context value
  const value = {
    // State
    currentLanguage,
    isLoading,

    // Language info
    languages: SUPPORTED_LANGUAGES,
    currentLanguageInfo: getCurrentLanguage(),
    isRTL: isRTL(),
    availableLanguages: getAvailableLanguages(),

    // Actions
    changeLanguage,
    t,

    // Formatters
    formatNumber: (number) => {
      try {
        return new Intl.NumberFormat(currentLanguage === 'hi' ? 'hi-IN' : 'en-IN').format(number)
      } catch (error) {
        return number.toString()
      }
    },
    
    formatCurrency: (amount, currency = 'INR') => {
      try {
        return new Intl.NumberFormat(currentLanguage === 'hi' ? 'hi-IN' : 'en-IN', {
          style: 'currency',
          currency,
        }).format(amount)
      } catch (error) {
        return `₹${amount}`
      }
    },
    
    formatDate: (date, options = {}) => {
      try {
        return new Intl.DateTimeFormat(currentLanguage === 'hi' ? 'hi-IN' : 'en-IN', options).format(new Date(date))
      } catch (error) {
        return new Date(date).toLocaleDateString()
      }
    }
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Custom hook to use Language Context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

// Export context for advanced use cases
export { LanguageContext }
