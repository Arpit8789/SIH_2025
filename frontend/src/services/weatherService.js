// src/services/weatherService.js - ENHANCED VERSION
import api from './api';

export const weatherService = {
  /**
   * Get current weather with AI advisory
   */
  getCurrentWeather: async () => {
    try {
      const response = await api.get('/weather/current');
      return response;
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw error;
    }
  },

  /**
   * Get weather forecast with agricultural insights
   */
  getWeatherForecast: async (params = {}) => {
    try {
      const response = await api.get('/weather/forecast', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      throw error;
    }
  },

  /**
   * Get weather alerts for farmer
   */
  getWeatherAlerts: async (params = {}) => {
    try {
      const response = await api.get('/weather/alerts', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      throw error;
    }
  },

  /**
   * Mark weather alerts as read
   */
  markAlertsAsRead: async (alertIds = []) => {
    try {
      const response = await api.post('/weather/alerts/mark-read', { alertIds });
      return response;
    } catch (error) {
      console.error('Failed to mark alerts as read:', error);
      throw error;
    }
  },

  /**
   * Submit feedback for AI advisory
   */
  submitAdvisoryFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/weather/advisory/feedback', feedbackData);
      return response;
    } catch (error) {
      console.error('Failed to submit advisory feedback:', error);
      throw error;
    }
  },

  /**
   * Test AI service connection
   */
  testAIConnection: async () => {
    try {
      const response = await api.get('/weather/test-ai');
      return response;
    } catch (error) {
      console.error('AI connection test failed:', error);
      throw error;
    }
  },

  /**
   * Get cached weather advisory
   */
  getCachedAdvisory: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/weather/advisory', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch cached advisory:', error);
      throw error;
    }
  },

  /**
   * Get weekly weather insights
   */
  getWeeklyInsights: async () => {
    try {
      const response = await api.get('/weather/insights/weekly');
      return response;
    } catch (error) {
      console.error('Failed to fetch weekly insights:', error);
      throw error;
    }
  },

  /**
   * Get regional crop information
   */
  getRegionalCrops: async (state, season = null) => {
    try {
      const params = { state };
      if (season) params.season = season;
      
      const response = await api.get('/weather/crops/regional', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch regional crops:', error);
      throw error;
    }
  },

  /**
   * Get crop-specific weather advice
   */
  getCropSpecificAdvice: async (crops, weatherData) => {
    try {
      const response = await api.post('/weather/advice/crop-specific', {
        crops,
        weatherData
      });
      return response;
    } catch (error) {
      console.error('Failed to get crop-specific advice:', error);
      throw error;
    }
  },

  /**
   * Subscribe to weather notifications
   */
  subscribeToNotifications: async (preferences) => {
    try {
      const response = await api.post('/weather/notifications/subscribe', preferences);
      return response;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from weather notifications
   */
  unsubscribeFromNotifications: async () => {
    try {
      const response = await api.delete('/weather/notifications/unsubscribe');
      return response;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async () => {
    try {
      const response = await api.get('/weather/notifications/preferences');
      return response;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put('/weather/notifications/preferences', preferences);
      return response;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },

  /**
   * Get weather statistics
   */
  getWeatherStats: async (period = '30d') => {
    try {
      const response = await api.get('/weather/stats', { 
        params: { period } 
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch weather statistics:', error);
      throw error;
    }
  },

  /**
   * Get seasonal farming calendar
   */
  getSeasonalCalendar: async (state, year = null) => {
    try {
      const params = { state };
      if (year) params.year = year;
      
      const response = await api.get('/weather/calendar/seasonal', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch seasonal calendar:', error);
      throw error;
    }
  },

  /**
   * Search weather history
   */
  getWeatherHistory: async (startDate, endDate, location = null) => {
    try {
      const params = { startDate, endDate };
      if (location) params.location = location;
      
      const response = await api.get('/weather/history', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch weather history:', error);
      throw error;
    }
  },

  /**
   * Get alert statistics
   */
  getAlertStats: async (period = '30d') => {
    try {
      const response = await api.get('/weather/alerts/stats', {
        params: { period }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch alert statistics:', error);
      throw error;
    }
  },

  /**
   * Export weather data
   */
  exportWeatherData: async (startDate, endDate, format = 'csv') => {
    try {
      const response = await api.get('/weather/export', {
        params: { startDate, endDate, format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to export weather data:', error);
      throw error;
    }
  },

  /**
   * Report weather data issue
   */
  reportWeatherIssue: async (issueData) => {
    try {
      const response = await api.post('/weather/report-issue', issueData);
      return response;
    } catch (error) {
      console.error('Failed to report weather issue:', error);
      throw error;
    }
  },

  // Fallback method using external weather API (when backend is down)
  getExternalWeather: async (lat, lon) => {
    try {
      // Using Open-Meteo directly as fallback
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia/Kolkata`
      );
      
      if (!response.ok) {
        throw new Error('External weather API request failed');
      }
      
      const data = await response.json();
      
      // Transform to match our format
      return {
        success: true,
        data: {
          current: {
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation || 0,
            condition: {
              main: this.getWeatherCondition(data.current.weather_code),
              description: this.getWeatherDescription(data.current.weather_code)
            },
            wind: {
              speed: Math.round(data.current.wind_speed_10m)
            }
          },
          location: {
            name: 'Your Location',
            coordinates: { latitude: lat, longitude: lon }
          },
          lastUpdated: new Date().toISOString(),
          source: 'external'
        }
      };
    } catch (error) {
      throw new Error(`External weather service failed: ${error.message}`);
    }
  },

  // Helper methods for external weather
  getWeatherCondition(code) {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2 || code === 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 86) return 'snow';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'cloudy';
  },

  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      51: 'Light drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      95: 'Thunderstorm'
    };
    return descriptions[code] || 'Unknown';
  }
};

export default weatherService;
