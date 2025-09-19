// src/utils/marketConstants.js
// frontend/src/utils/marketConstants.js - POINT TO REAL BACKEND
export const AGMARKET_API_BASE = 'http://localhost:5000/api/real-market';
export const FALLBACK_API = 'http://localhost:5000/api/real-market';


export const CROP_CATEGORIES = {
  cereals: { 
    name: { en: 'Cereals', hi: 'अनाज', pa: 'ਅਨਾਜ' }, 
    icon: '🌾', 
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  vegetables: { 
    name: { en: 'Vegetables', hi: 'सब्जियां', pa: 'ਸਬਜ਼ੀਆਂ' }, 
    icon: '🥕', 
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  oilseeds: { 
    name: { en: 'Oilseeds', hi: 'तिलहन', pa: 'ਤੇਲ ਬੀਜ' }, 
    icon: '🌻', 
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

export const RECOMMENDATION_TYPES = {
  SELL: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: '📈',
    urgency: 'high'
  },
  HOLD: {
    color: 'yellow', 
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: '⏳',
    urgency: 'medium'
  },
  WAIT: {
    color: 'blue',
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: '⏰',
    urgency: 'low'
  }
};

export const PRICE_TRENDS = {
  RISING: { icon: '📈', color: 'green', message: 'बढ़ रहे हैं' },
  FALLING: { icon: '📉', color: 'red', message: 'गिर रहे हैं' },
  STABLE: { icon: '➖', color: 'gray', message: 'स्थिर हैं' }
};

export const CACHE_KEYS = {
  MARKET_DATA: 'krishi_market_data_',
  PRICE_HISTORY: 'krishi_price_history_',
  USER_LOCATION: 'krishi_user_location',
  LAST_SEARCH: 'krishi_last_search'
};

export const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export const DEFAULT_LOCATION = {
  state: 'punjab',
  market: 'ludhiana'
};
