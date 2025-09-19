import { useCallback, useEffect, useState } from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { translationService } from '../utils/translation';
import { textExtractor } from '../utils/textExtractor';
import { errorHandler } from '../utils/errorHandler';
import { TRANSLATION_CONFIG } from '../config/languageConfig';

export const useTranslation = () => {
  const { 
    currentLanguage, 
    isTranslating, 
    startTranslating, 
    stopTranslating 
  } = useLanguageContext();
  
  const [translationQueue, setTranslationQueue] = useState([]);
  const [lastTranslatedLanguage, setLastTranslatedLanguage] = useState(null);

  // Translate entire page content
  const translatePage = useCallback(async () => {
    if (!currentLanguage || currentLanguage.code === 'en') {
      return; // Skip translation for English or if no language selected
    }

    if (isTranslating) {
      return; // Prevent concurrent translations
    }

    try {
      startTranslating();

      // Extract text from page
      const textMappings = textExtractor.extractFromElements();
      
      if (textMappings.length === 0) {
        stopTranslating();
        return;
      }

      // Prepare texts for batch translation
      const textsToTranslate = textExtractor.prepareBatchTexts(textMappings);
      
      // Translate in batches to avoid overwhelming the service
      const batchSize = TRANSLATION_CONFIG.MAX_BATCH_SIZE || 20;
      const translatedResults = [];

      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        
        try {
          const batchResults = await translationService.translateBatch(
            batch, 
            currentLanguage.code, 
            'auto'
          );
          
          translatedResults.push(...batchResults);
        } catch (error) {
          const errorResult = errorHandler.handleTranslationError(error, {
            batchIndex: Math.floor(i / batchSize),
            targetLanguage: currentLanguage.code
          });
          
          // Use original texts as fallback
          translatedResults.push(...batch);
        }

        // Small delay between batches to be gentle on the service
        if (i + batchSize < textsToTranslate.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Map results back and apply to DOM
      const finalMappings = textExtractor.mapTranslationResults(textMappings, translatedResults);
      const updatedCount = textExtractor.applyTranslations(finalMappings);

      setLastTranslatedLanguage(currentLanguage.code);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Translated ${updatedCount} elements to ${currentLanguage.label}`);
      }

    } catch (error) {
      errorHandler.handleTranslationError(error, {
        action: 'translatePage',
        targetLanguage: currentLanguage.code
      });
    } finally {
      stopTranslating();
    }
  }, [currentLanguage, isTranslating, startTranslating, stopTranslating]);

  // Translate specific text
  const translateText = useCallback(async (text, targetLanguage = null) => {
    if (!text || !text.trim()) return text;
    
    const target = targetLanguage || currentLanguage?.code || 'en';
    
    if (target === 'en') return text; // No need to translate to English

    try {
      return await translationService.translateText(text, target, 'auto');
    } catch (error) {
      const errorResult = errorHandler.handleTranslationError(error, {
        text: text.substring(0, 50) + '...',
        targetLanguage: target
      });
      
      return errorResult.fallback || text;
    }
  }, [currentLanguage]);

  // Auto-translate page when language changes
  useEffect(() => {
    if (currentLanguage && 
        currentLanguage.code !== 'en' && 
        currentLanguage.code !== lastTranslatedLanguage) {
      
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        translatePage();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [currentLanguage, translatePage, lastTranslatedLanguage]);

  return {
    translatePage,
    translateText,
    isTranslating,
    currentLanguage,
    canTranslate: currentLanguage && currentLanguage.code !== 'en'
  };
};
