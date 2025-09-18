// src/hooks/useWeather.js
import { useState, useCallback } from 'react';
import { weatherService } from '@services/weatherService';
import { useNotification } from '@context/NotificationContext';
import useApi from './useApi';

// Weather data hook connected to backend
export const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const { showError } = useNotification();

  // Current weather API hook
  const currentWeatherApi = useApi(weatherService.getCurrentWeather, {
    showErrorNotification: false, // Handle errors manually
  });

  // Weather forecast API hook
  const forecastApi = useApi(weatherService.getWeatherForecast, {
    showErrorNotification: false,
  });

  // Weather alerts API hook
  const alertsApi = useApi(weatherService.getWeatherAlerts, {
    showErrorNotification: false,
  });

  // Get current weather for farmer's location
  const getCurrentWeather = useCallback(async () => {
    const result = await currentWeatherApi.execute();
    
    if (result.success) {
      setWeatherData(result.data);
      return result.data;
    } else {
      showError('Unable to fetch weather data. Please try again.');
      return null;
    }
  }, [currentWeatherApi, showError]);

  // Get weather forecast
  const getForecast = useCallback(async (days = 5) => {
    const result = await forecastApi.execute({ days });
    
    if (result.success) {
      return result.data;
    } else {
      showError('Unable to fetch weather forecast. Please try again.');
      return null;
    }
  }, [forecastApi, showError]);

  // Get weather alerts
  const getWeatherAlerts = useCallback(async (severity = null) => {
    const params = severity ? { severity } : {};
    const result = await alertsApi.execute(params);
    
    if (result.success) {
      return result.data;
    } else {
      showError('Unable to fetch weather alerts. Please try again.');
      return null;
    }
  }, [alertsApi, showError]);

  // Get external weather data as fallback
  const getExternalWeather = useCallback(async (latitude, longitude) => {
    try {
      const data = await weatherService.getExternalWeather(latitude, longitude);
      
      // Transform external API data to our format
      const transformedData = {
        location: {
          name: data.name,
          country: data.sys.country,
          coordinates: { latitude, longitude },
        },
        current: {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          cloudCover: data.clouds.all,
          condition: {
            main: data.weather.main,
            description: data.weather.description,
            icon: data.weather.icon,
          },
        },
        lastUpdated: new Date(data.dt * 1000),
      };

      setWeatherData(transformedData);
      return transformedData;
    } catch (error) {
      showError('Unable to fetch weather data from external source.');
      return null;
    }
  }, [showError]);

  // Check if weather data is recent (within last hour)
  const isWeatherDataFresh = useCallback(() => {
    if (!weatherData || !weatherData.lastUpdated) return false;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(weatherData.lastUpdated) > oneHourAgo;
  }, [weatherData]);

  // Get weather recommendation for farming
  const getWeatherRecommendation = useCallback(() => {
    if (!weatherData) return null;

    const { temperature, humidity, condition } = weatherData.current;
    const recommendations = [];

    // Temperature recommendations
    if (temperature > 35) {
      recommendations.push({
        type: 'warning',
        title: 'High Temperature Alert',
        message: 'Very hot weather. Increase irrigation and provide shade for sensitive crops.',
        priority: 'high',
      });
    } else if (temperature < 10) {
      recommendations.push({
        type: 'warning',
        title: 'Low Temperature Alert',
        message: 'Cold weather may affect crop growth. Consider frost protection.',
        priority: 'high',
      });
    }

    // Humidity recommendations
    if (humidity > 80) {
      recommendations.push({
        type: 'caution',
        title: 'High Humidity',
        message: 'High humidity increases disease risk. Monitor crops for fungal infections.',
        priority: 'medium',
      });
    }

    // Condition-based recommendations
    if (condition.main.toLowerCase().includes('rain')) {
      recommendations.push({
        type: 'info',
        title: 'Rainy Weather',
        message: 'Good for rain-dependent crops. Avoid field operations if muddy.',
        priority: 'low',
      });
    }

    return recommendations;
  }, [weatherData]);

  return {
    // Data
    weatherData,
    currentWeather: currentWeatherApi.data,
    forecast: forecastApi.data,
    alerts: alertsApi.data,
    
    // Loading states
    isLoadingCurrent: currentWeatherApi.loading,
    isLoadingForecast: forecastApi.loading,
    isLoadingAlerts: alertsApi.loading,
    
    // Error states
    currentWeatherError: currentWeatherApi.error,
    forecastError: forecastApi.error,
    alertsError: alertsApi.error,
    
    // Actions
    getCurrentWeather,
    getForecast,
    getWeatherAlerts,
    getExternalWeather,
    
    // Utilities
    isWeatherDataFresh,
    getWeatherRecommendation,
    
    // Reset functions
    resetCurrentWeather: currentWeatherApi.reset,
    resetForecast: forecastApi.reset,
    resetAlerts: alertsApi.reset,
  };
};

export default useWeather;
