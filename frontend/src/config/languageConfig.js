// Language configuration for Hindi, English, Punjabi
export const LANGUAGES = {
  ENGLISH: { code: 'en', name: 'English', label: 'English' },
  HINDI: { code: 'hi', name: 'Hindi', label: 'हिन्दी' },
  PUNJABI: { code: 'pa', name: 'Punjabi', label: 'ਪੰਜਾਬੀ' }
};

export const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

export const DEFAULT_LANGUAGE = LANGUAGES.ENGLISH;

// LibreTranslate API configuration
export const LIBRETRANSLATE_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5000',
  ENDPOINTS: {
    TRANSLATE: '/translate',
    LANGUAGES: '/languages',
    DETECT: '/detect'
  },
  TIMEOUT: 10000,
  MAX_BATCH_SIZE: 50
};

// Translation settings
export const TRANSLATION_CONFIG = {
  AUTO_DETECT: 'auto',
  SUPPORTED_CODES: ['en', 'hi', 'pa'],
  SKIP_ATTRIBUTES: ['data-no-translate', 'contenteditable="false"'],
  TEXT_NODE_SELECTORS: 'p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, label'
};
