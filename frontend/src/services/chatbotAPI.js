// services/chatbotAPI.js - Chatbot API Integration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const chatbotAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/chatbot`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for AI responses
});

// Add request interceptor to include auth token if available
chatbotAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
chatbotAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Chatbot API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Don't redirect - chatbot should work without auth
    }
    
    return Promise.reject(error);
  }
);

class ChatbotAPIService {
  // Initialize chat session
  async initializeChat(currentPage, language = 'en') {
    try {
      const response = await chatbotAPI.post('/initialize', {
        currentPage,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to initialize chat');
    }
  }

  // Send message to chatbot
  async sendMessage(sessionId, message, language = 'en', isVoice = false) {
    try {
      const response = await chatbotAPI.post('/message', {
        sessionId,
        message,
        language,
        isVoice
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  // Get quick actions
  async getQuickActions(currentPage, language = 'en') {
    try {
      const response = await chatbotAPI.get('/quick-actions', {
        params: { currentPage, language }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get quick actions:', error);
      return { data: { quickActions: [] } }; // Return empty array on error
    }
  }

  // Handle quick action click
  async handleQuickAction(sessionId, action, language = 'en') {
    try {
      const response = await chatbotAPI.post('/quick-action', {
        sessionId,
        action,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Failed to handle quick action:', error);
      throw new Error(error.response?.data?.message || 'Failed to process action');
    }
  }

  // Update chat context (when user navigates to different page)
  async updateContext(sessionId, currentPage, language = 'en') {
    try {
      const response = await chatbotAPI.put('/context', {
        sessionId,
        currentPage,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update context:', error);
      // Non-critical error, don't throw
      return null;
    }
  }

  // Get chat history
  async getChatHistory(sessionId) {
    try {
      const response = await chatbotAPI.get(`/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return { data: { messages: [] } };
    }
  }

  // End chat session
  async endSession(sessionId) {
    try {
      const response = await chatbotAPI.post('/end-session', {
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to end session:', error);
      // Non-critical error, don't throw
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await chatbotAPI.get('/health');
      return response.data;
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      return { 
        data: { 
          status: 'unhealthy', 
          geminiAI: { status: 'unhealthy', message: 'Connection failed' } 
        } 
      };
    }
  }

  // Process voice message (placeholder for future implementation)
  async sendVoiceMessage(sessionId, audioBlob, language = 'en') {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.wav');
      formData.append('sessionId', sessionId);
      formData.append('language', language);

      const response = await chatbotAPI.post('/voice-message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute timeout for voice processing
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send voice message:', error);
      throw new Error(error.response?.data?.message || 'Failed to process voice message');
    }
  }
}

export default new ChatbotAPIService();
