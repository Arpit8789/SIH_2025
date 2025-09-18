// src/services/cropService.js
import api from './api';

export const cropService = {
  // Get all crops
  getAllCrops: async (params = {}) => {
    try {
      const response = await api.get('/crops', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get crop by ID
  getCropById: async (cropId) => {
    try {
      const response = await api.get(`/crops/${cropId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get crops by category
  getCropsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/crops/category/${category}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get crops by season
  getCropsBySeason: async (season, params = {}) => {
    try {
      const response = await api.get(`/crops/season/${season}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search crops
  searchCrops: async (params = {}) => {
    try {
      const response = await api.get('/crops/search', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
