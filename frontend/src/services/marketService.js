// src/services/marketService.js
import api from './api';

export const marketService = {
  // Get current market prices
  getCurrentPrices: async (params = {}) => {
    try {
      const response = await api.get('/market/prices/current', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get price history
  getPriceHistory: async (params = {}) => {
    try {
      const response = await api.get('/market/prices/history', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get price trends
  getPriceTrends: async (params = {}) => {
    try {
      const response = await api.get('/market/prices/trends', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get market analysis
  getMarketAnalysis: async (params = {}) => {
    try {
      const response = await api.get('/market/analysis', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
