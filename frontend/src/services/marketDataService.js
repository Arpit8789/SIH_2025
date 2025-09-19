// src/services/marketDataService.js
import { AGMARKET_API_BASE, FALLBACK_API, CACHE_KEYS, CACHE_DURATION } from '@/utils/marketConstants';

class MarketDataService {
  constructor() {
    this.baseUrl = AGMARKET_API_BASE;
    this.fallbackUrl = FALLBACK_API;
  }

  // Fetch current market prices from agmarknet
  async fetchCurrentPrices(commodity, state, market = '') {
    const cacheKey = `${CACHE_KEYS.MARKET_DATA}${commodity}_${state}_${market}`;
    
    // Check cache first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      console.log('📦 Using cached market data');
      return cachedData;
    }

    try {
      // Primary API call to agmarknet wrapper
      const response = await fetch(
        `${this.baseUrl}/request?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&market=${encodeURIComponent(market)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform agmarknet data to our format
      const formattedData = this.formatMarketData(data);
      
      // Cache the data
      this.saveToCache(cacheKey, formattedData);
      
      console.log('🌐 Fresh market data fetched');
      return formattedData;
      
    } catch (error) {
      console.error('❌ Primary API failed:', error);
      
      // Try fallback API
      try {
        return await this.fetchFromFallbackAPI(commodity, state, market);
      } catch (fallbackError) {
        console.error('❌ Fallback API also failed:', fallbackError);
        
        // Return mock data as last resort
        return this.getMockData(commodity, state, market);
      }
    }
  }

  // Fetch historical data for trend analysis
  async fetchHistoricalPrices(commodity, state, market, days = 30) {
    const cacheKey = `${CACHE_KEYS.PRICE_HISTORY}${commodity}_${state}_${market}_${days}`;
    
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Generate mock historical data for now (in real app, this would come from API)
      const historicalData = this.generateHistoricalData(commodity, days);
      
      this.saveToCache(cacheKey, historicalData);
      return historicalData;
      
    } catch (error) {
      console.error('❌ Failed to fetch historical data:', error);
      return this.generateHistoricalData(commodity, days);
    }
  }

  // Fallback API implementation
  async fetchFromFallbackAPI(commodity, state, market) {
    const response = await fetch(
      `${this.fallbackUrl}?api-key=YOUR_API_KEY&format=json&filters[commodity]=${commodity}&filters[state]=${state}`
    );
    
    if (!response.ok) {
      throw new Error('Fallback API failed');
    }
    
    const data = await response.json();
    return this.formatFallbackData(data);
  }

  // Format agmarknet API response
  formatMarketData(rawData) {
    if (!rawData || !rawData.data) {
      throw new Error('Invalid API response format');
    }

    return {
      commodity: rawData.commodity,
      state: rawData.state,
      market: rawData.market || rawData.district,
      date: rawData.date || new Date().toISOString().split('T')[0],
      minPrice: parseInt(rawData.min_price) || 0,
      maxPrice: parseInt(rawData.max_price) || 0,
      modalPrice: parseInt(rawData.modal_price) || parseInt(rawData.price) || 0,
      priceUnit: 'quintal',
      source: 'agmarknet',
      lastUpdated: new Date().toISOString()
    };
  }

  // Format fallback API response
  formatFallbackData(rawData) {
    const records = rawData.records || [];
    
    if (records.length === 0) {
      throw new Error('No data available from fallback API');
    }

    const latest = records[0];
    
    return {
      commodity: latest.commodity,
      state: latest.state,
      market: latest.market,
      date: latest.price_date,
      minPrice: parseInt(latest.min_price) || 0,
      maxPrice: parseInt(latest.max_price) || 0,
      modalPrice: parseInt(latest.modal_price) || 0,
      priceUnit: 'quintal',
      source: 'data.gov.in',
      lastUpdated: new Date().toISOString()
    };
  }

  // Generate historical data (mock implementation)
  generateHistoricalData(commodity, days) {
    const data = [];
    const basePrice = this.getBasePriceForCrop(commodity);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic price variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const seasonalEffect = this.getSeasonalEffect(commodity, date.getMonth() + 1);
      const trendEffect = i / days * 0.05; // Slight upward trend
      
      const price = Math.round(basePrice * (1 + variation + seasonalEffect + trendEffect));
      
      data.push({
        date: date.toISOString().split('T')[0],
        modalPrice: Math.max(price * 0.9, price),
        minPrice: Math.max(price * 0.85, price - 200),
        maxPrice: price * 1.15,
        volume: Math.round(Math.random() * 1000 + 500)
      });
    }
    
    return data;
  }

  // Get base price for different crops
  getBasePriceForCrop(commodity) {
    const basePrices = {
      'wheat': 2200,
      'rice': 2800,
      'potato': 1500,
      'onion': 2000,
      'mustard': 4500
    };
    
    return basePrices[commodity.toLowerCase()] || 2000;
  }

  // Get seasonal price effect
  getSeasonalEffect(commodity, month) {
    const seasonalEffects = {
      'wheat': { 3: 0.1, 4: 0.15, 5: 0.1, 6: -0.1, 7: -0.15, 8: -0.1 },
      'rice': { 10: 0.1, 11: 0.15, 12: 0.1, 1: -0.1, 2: -0.15, 3: -0.1 },
      'potato': { 2: 0.15, 3: 0.2, 4: 0.15, 11: -0.1, 12: -0.15, 1: -0.1 },
      'onion': { 6: 0.2, 7: 0.25, 8: 0.2, 2: -0.15, 3: -0.2, 4: -0.15 },
      'mustard': { 3: 0.1, 4: 0.15, 5: 0.1, 9: -0.1, 10: -0.15, 11: -0.1 }
    };
    
    const effects = seasonalEffects[commodity.toLowerCase()] || {};
    return effects[month] || 0;
  }

  // Mock data as last resort
  getMockData(commodity, state, market) {
    const basePrice = this.getBasePriceForCrop(commodity);
    const variation = Math.random() * 0.1 - 0.05; // ±5% variation
    const modalPrice = Math.round(basePrice * (1 + variation));
    
    return {
      commodity: commodity,
      state: state,
      market: market || 'Default Market',
      date: new Date().toISOString().split('T')[0],
      minPrice: Math.round(modalPrice * 0.9),
      maxPrice: Math.round(modalPrice * 1.1),
      modalPrice: modalPrice,
      priceUnit: 'quintal',
      source: 'mock',
      lastUpdated: new Date().toISOString()
    };
  }

  // Cache management
  saveToCache(key, data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_DURATION
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ Failed to save to cache:', error);
    }
  }

  getFromCache(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('⚠️ Failed to read from cache:', error);
      return null;
    }
  }

  clearCache() {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(key));
        keys.forEach(k => localStorage.removeItem(k));
      });
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear cache:', error);
    }
  }
}

export default new MarketDataService();
