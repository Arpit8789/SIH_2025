// src/services/buyerService.js
import api from './api';

export const buyerService = {
  // Get buyer profile
  getProfile: async () => {
    try {
      const response = await api.get('/buyer/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update buyer profile
  updateProfile: async (profileData) => {
    try {
      let response;
      
      if (profileData instanceof FormData) {
        response = await api.upload('/buyer/profile', profileData);
      } else {
        response = await api.put('/buyer/profile', profileData);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search farmers
  searchFarmers: async (params = {}) => {
    try {
      const response = await api.get('/buyer/search-farmers', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get available crops
  getAvailableCrops: async (params = {}) => {
    try {
      const response = await api.get('/buyer/available-crops', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create purchase order
  createPurchaseOrder: async (orderData) => {
    try {
      const response = await api.post('/buyer/purchase-orders', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get purchase history
  getPurchaseHistory: async (params = {}) => {
    try {
      const response = await api.get('/buyer/purchase-history', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get market trends
  getMarketTrends: async (params = {}) => {
    try {
      const response = await api.get('/buyer/market-trends', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
