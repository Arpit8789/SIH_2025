import { LIBRETRANSLATE_CONFIG, TRANSLATION_CONFIG } from '../config/languageConfig';

class TranslationService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? '/api' // Use backend proxy in development
      : LIBRETRANSLATE_CONFIG.BASE_URL; // Direct in production if needed
  }

  // Translate single text
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    if (!text || !text.trim()) return text;
    
    try {
      const response = await fetch(`${this.baseURL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SIH2025-Translation-App'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }),
        timeout: LIBRETRANSLATE_CONFIG.TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }

  // Translate multiple texts in batch
  async translateBatch(texts, targetLanguage, sourceLanguage = 'auto') {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const validTexts = texts.filter(text => text && text.trim());
    if (validTexts.length === 0) return texts;

    try {
      const promises = validTexts.map(text => 
        this.translateText(text, targetLanguage, sourceLanguage)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts on error
    }
  }

  // Get available languages
  async getAvailableLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/languages`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SIH2025-Translation-App'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get languages: ${response.status}`);
      }

      const languages = await response.json();
      
      // Filter only supported languages (en, hi, pa)
      return languages.filter(lang => 
        TRANSLATION_CONFIG.SUPPORTED_CODES.includes(lang.code)
      );
    } catch (error) {
      console.error('Get languages error:', error);
      return TRANSLATION_CONFIG.SUPPORTED_CODES.map(code => ({ code }));
    }
  }

  // Detect language of text
  async detectLanguage(text) {
    if (!text || !text.trim()) return 'en';

    try {
      const response = await fetch(`${this.baseURL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SIH2025-Translation-App'
        },
        body: JSON.stringify({ q: text })
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`);
      }

      const result = await response.json();
      return result[0]?.language || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService();
