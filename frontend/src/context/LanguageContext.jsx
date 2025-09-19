import { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../config/languageConfig';

const LanguageContext = createContext({
  currentLanguage: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  isTranslating: false,
  hasSelectedLanguage: false
});

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  const setLanguage = useCallback((languageCode) => {
    const selectedLanguage = Object.values(LANGUAGES).find(
      lang => lang.code === languageCode
    );
    
    if (selectedLanguage) {
      setCurrentLanguage(selectedLanguage);
      setHasSelectedLanguage(true);
      return selectedLanguage;
    }
    
    console.warn(`Language code ${languageCode} not supported`);
    return null;
  }, []);

  const startTranslating = useCallback(() => {
    setIsTranslating(true);
  }, []);

  const stopTranslating = useCallback(() => {
    setIsTranslating(false);
  }, []);

  const contextValue = {
    currentLanguage,
    setLanguage,
    isTranslating,
    hasSelectedLanguage,
    startTranslating,
    stopTranslating
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

// ✅ ADD THIS EXPORT
export { LanguageContext };

// ✅ OR MAKE IT DEFAULT EXPORT IF YOU PREFER
// export default LanguageContext;
