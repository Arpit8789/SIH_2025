import express from 'express';
import axios from 'axios';
import { i18nConfig } from '../config/i18nConfig.js';
import { batchProcessor } from '../utils/batchProcessor.js';

const router = express.Router();

// POST /api/translate - Translate text or batch of texts
router.post('/translate', async (req, res) => {
  try {
    const { q, source = 'auto', target, format = 'text' } = req.body;

    // Validation
    if (!q) {
      return res.status(400).json({
        error: 'Missing required parameter: q (text to translate)'
      });
    }

    if (!target) {
      return res.status(400).json({
        error: 'Missing required parameter: target (target language code)'
      });
    }

    // Validate target language
    if (!i18nConfig.SUPPORTED_LANGUAGES.includes(target)) {
      return res.status(400).json({
        error: `Unsupported target language: ${target}. Supported: ${i18nConfig.SUPPORTED_LANGUAGES.join(', ')}`
      });
    }

    // Handle batch translation (array of texts)
    if (Array.isArray(q)) {
      if (q.length === 0) {
        return res.json({ translatedTexts: [] });
      }

      if (q.length > i18nConfig.MAX_BATCH_SIZE) {
        return res.status(400).json({
          error: `Batch size too large. Maximum ${i18nConfig.MAX_BATCH_SIZE} texts allowed`
        });
      }

      // Process batch translation
      const batchResults = await batchProcessor.processBatch(
        q,
        async (text) => {
          const response = await axios.post(`${i18nConfig.LIBRETRANSLATE_URL}/translate`, {
            q: text,
            source,
            target,
            format
          }, {
            timeout: i18nConfig.REQUEST_TIMEOUT,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'SIH2025-Backend'
            }
          });

          return response.data.translatedText;
        },
        i18nConfig.CONCURRENT_REQUESTS
      );

      return res.json({
        translatedTexts: batchResults,
        sourceLanguage: source,
        targetLanguage: target,
        format
      });
    }

    // Handle single text translation
    const response = await axios.post(`${i18nConfig.LIBRETRANSLATE_URL}/translate`, {
      q,
      source,
      target,
      format
    }, {
      timeout: i18nConfig.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SIH2025-Backend'
      }
    });

    res.json({
      translatedText: response.data.translatedText,
      sourceLanguage: source,
      targetLanguage: target,
      format
    });

  } catch (error) {
    console.error('Translation error:', error);

    // Handle LibreTranslate specific errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.statusText;

      switch (status) {
        case 400:
          return res.status(400).json({
            error: 'Invalid translation request',
            details: message
          });
        case 429:
          return res.status(429).json({
            error: 'Rate limit exceeded',
            details: 'Please try again later'
          });
        case 500:
          return res.status(500).json({
            error: 'Translation service error',
            details: 'LibreTranslate server error'
          });
        default:
          return res.status(status).json({
            error: 'Translation service error',
            details: message
          });
      }
    }

    // Handle network/timeout errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Translation service unavailable',
        details: 'LibreTranslate service is not running'
      });
    }

    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Translation request timeout',
        details: 'LibreTranslate service is responding slowly'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/languages - Get available languages
router.get('/languages', async (req, res) => {
  try {
    const response = await axios.get(`${i18nConfig.LIBRETRANSLATE_URL}/languages`, {
      timeout: i18nConfig.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'SIH2025-Backend'
      }
    });

    // Filter to only supported languages
    const availableLanguages = response.data.filter(lang =>
      i18nConfig.SUPPORTED_LANGUAGES.includes(lang.code)
    );

    res.json({
      languages: availableLanguages,
      supported: i18nConfig.SUPPORTED_LANGUAGES
    });

  } catch (error) {
    console.error('Get languages error:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Translation service unavailable',
        details: 'LibreTranslate service is not running'
      });
    }

    res.status(500).json({
      error: 'Failed to get available languages',
      details: error.message
    });
  }
});

// POST /api/detect - Detect language of text
router.post('/detect', async (req, res) => {
  try {
    const { q } = req.body;

    if (!q) {
      return res.status(400).json({
        error: 'Missing required parameter: q (text to detect)'
      });
    }

    const response = await axios.post(`${i18nConfig.LIBRETRANSLATE_URL}/detect`, {
      q
    }, {
      timeout: i18nConfig.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SIH2025-Backend'
      }
    });

    res.json({
      detectedLanguage: response.data[0]?.language || 'en',
      confidence: response.data[0]?.confidence || 0,
      allDetections: response.data
    });

  } catch (error) {
    console.error('Language detection error:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Translation service unavailable'
      });
    }

    res.status(500).json({
      error: 'Language detection failed',
      details: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${i18nConfig.LIBRETRANSLATE_URL}/languages`, {
      timeout: 5000
    });

    res.json({
      status: 'healthy',
      libretranslate: 'available',
      supportedLanguages: i18nConfig.SUPPORTED_LANGUAGES,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      libretranslate: 'unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
