// src/services/weatherService.js - WEATHER API SERVICE
import api from './api';

const API_BASE = '/weather';

export const weatherService = {
  // Get current weather with AI insights
  getCurrentWeather: async (lat, lon) => {
    try {
      const response = await api.get(`${API_BASE}/current`, {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch current weather');
    }
  },

  // Get 7-day forecast
  getForecast: async (lat, lon, days = 7) => {
    try {
      const response = await api.get(`${API_BASE}/forecast`, {
        params: { lat, lon, days }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather forecast');
    }
  },

  // Get AI farming insights
  getInsights: async (lat, lon) => {
    try {
      const response = await api.get(`${API_BASE}/insights`, {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather insights');
    }
  },

  // Get weather for specific location by name
  getWeatherByLocation: async (locationName) => {
    try {
      const response = await api.get(`${API_BASE}/location/${locationName}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather for location');
    }
  },

  // Toggle weather notifications (requires auth)
  toggleNotifications: async (enabled, types, schedule) => {
    try {
      const response = await api.post(`${API_BASE}/notifications/toggle`, {
        enabled,
        types,
        schedule
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  },

  // Send immediate weather alert (requires auth)
  sendAlert: async (alertType, message) => {
    try {
      const response = await api.post(`${API_BASE}/alert/send`, {
        alertType,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send weather alert');
    }
  },

  // Get weather statistics (requires auth)
  getStats: async () => {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather statistics');
    }
  },

  // Test weather service
  testService: async () => {
    try {
      const response = await api.get(`${API_BASE}/test`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Weather service test failed');
    }
  },

  // Get supported locations
  getSupportedLocations: async () => {
    try {
      // Mock data for now - can be replaced with real API
      return {
        success: true,
        data: {
          locations: [
            {
              id: 'punjab',
              name: 'Punjab',
              coordinates: { lat: 30.6793, lon: 76.7284 },
              districts: ['Mohali', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
              crops: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize']
            },
            {
              id: 'haryana',
              name: 'Haryana',
              coordinates: { lat: 29.0588, lon: 76.0856 },
              districts: ['Karnal', 'Hisar', 'Gurgaon', 'Faridabad', 'Panipat'],
              crops: ['Wheat', 'Rice', 'Barley', 'Mustard', 'Cotton']
            }
          ]
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch supported locations');
    }
  },

  // Request notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Format weather data for display
  formatWeatherData: (weatherData) => {
    return {
      temperature: Math.round(weatherData.temperature),
      feelsLike: Math.round(weatherData.feelsLike),
      humidity: weatherData.humidity,
      windSpeed: Math.round(weatherData.windSpeed),
      condition: weatherData.condition,
      lastUpdated: new Date(weatherData.lastUpdated)
    };
  },

  // Format forecast data
  formatForecastData: (forecastArray) => {
    return forecastArray.map(day => ({
      ...day,
      date: new Date(day.date),
      temperature: {
        min: Math.round(day.temperature.min),
        max: Math.round(day.temperature.max)
      }
    }));
  }
};

export default weatherService;
