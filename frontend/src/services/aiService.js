// src/services/aiService.js
import api from './api';

export const aiService = {
  // Chat with AI assistant
  chatWithAI: async (messageData) => {
    try {
      const response = await api.post('/ai/chat', messageData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Detect disease from image
  detectDisease: async (formData) => {
    try {
      const response = await api.upload('/ai/detect-disease', formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get AI crop recommendations
  getCropRecommendations: async (params = {}) => {
    try {
      const response = await api.get('/ai/crop-recommendations', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
