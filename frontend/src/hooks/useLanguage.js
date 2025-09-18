// src/hooks/useLanguage.js - FIXED (Use Context instead of Zustand)
import { useContext } from 'react'
import { LanguageContext } from '@/context/LanguageContext'

// Re-export useLanguage hook from context for convenience
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

export default useLanguage
