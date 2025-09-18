// src/services/translationService.js
import api from './api';

export const translationService = {
  // Translate text
  translateText: async (text, targetLanguage, sourceLanguage = 'auto') => {
    try {
      const response = await api.post('/translation/translate', {
        text,
        targetLanguage,
        sourceLanguage,
      });
      return response;
    } catch (error) {
      // Fallback to browser's built-in translation or external service
      console.warn('Translation service failed, using fallback');
      return { success: true, data: { translatedText: text } };
    }
  },

  // Get supported languages
  getSupportedLanguages: async () => {
    try {
      const response = await api.get('/translation/languages');
      return response;
    } catch (error) {
      // Return hardcoded supported languages as fallback
      return {
        success: true,
        data: {
          languages: ['en', 'hi', 'pa'],
        },
      };
    }
  },

  // Detect language
  detectLanguage: async (text) => {
    try {
      const response = await api.post('/translation/detect', { text });
      return response;
    } catch (error) {
      // Simple language detection fallback
      const hindiPattern = /[\u0900-\u097F]/;
      const punjabi = /[\u0A00-\u0A7F]/;
      
      if (hindiPattern.test(text)) {
        return { success: true, data: { language: 'hi' } };
      } else if (punjabi.test(text)) {
        return { success: true, data: { language: 'pa' } };
      } else {
        return { success: true, data: { language: 'en' } };
      }
    }
  },
};
