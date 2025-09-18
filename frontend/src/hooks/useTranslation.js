// src/hooks/useTranslation.js
import { useState, useCallback } from 'react';
import { translationService } from '@services/translationService';
import { useLanguage } from './useLanguage';
import { useNotification } from '@context/NotificationContext';

// Translation hook using backend translation service
export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  
  const { currentLanguage } = useLanguage();
  const { showError } = useNotification();

  // Translate text using backend service
  const translateText = useCallback(async (text, targetLanguage = currentLanguage, sourceLanguage = 'auto') => {
    if (!text || !text.trim()) return text;

    // Check cache first
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Skip if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    try {
      setIsTranslating(true);

      const response = await translationService.translateText(text, targetLanguage, sourceLanguage);
      
      if (response.success && response.data.translatedText) {
        const translatedText = response.data.translatedText;
        
        // Cache the translation
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: translatedText,
        }));

        return translatedText;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      showError('Translation failed. Showing original text.');
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, translationCache, showError]);

  // Detect language using backend service
  const detectLanguage = useCallback(async (text) => {
    if (!text || !text.trim()) return 'en';

    try {
      const response = await translationService.detectLanguage(text);
      
      if (response.success && response.data.language) {
        return response.data.language;
      } else {
        throw new Error('Language detection failed');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }, []);

  // Translate multiple texts at once
  const translateBatch = useCallback(async (texts, targetLanguage = currentLanguage) => {
    const translations = await Promise.allSettled(
      texts.map(text => translateText(text, targetLanguage))
    );

    return translations.map((result, index) => ({
      original: texts[index],
      translated: result.status === 'fulfilled' ? result.value : texts[index],
      success: result.status === 'fulfilled',
    }));
  }, [translateText, currentLanguage]);

  // Clear translation cache
  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);

  return {
    translateText,
    detectLanguage,
    translateBatch,
    isTranslating,
    clearCache,
    cacheSize: Object.keys(translationCache).length,
  };
};

export default useTranslation;
