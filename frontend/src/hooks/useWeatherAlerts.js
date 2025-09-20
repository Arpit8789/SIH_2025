// src/hooks/useWeatherAlerts.js - WEATHER ALERTS HOOK
import { useState, useEffect, useCallback } from 'react';
import { weatherService } from '../services/weatherService';

export const useWeatherAlerts = (location, options = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    enableNotifications = true
  } = options;

  const fetchWeatherData = useCallback(async () => {
    if (!location?.lat || !location?.lon) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all weather data in parallel
      const [currentResponse, forecastResponse, insightsResponse] = await Promise.all([
        weatherService.getCurrentWeather(location.lat, location.lon),
        weatherService.getForecast(location.lat, location.lon, 7),
        weatherService.getInsights(location.lat, location.lon)
      ]);

      if (currentResponse.success) {
        setWeatherData(currentResponse.data.current);
        setAlerts(currentResponse.data.alerts || []);
      }

      if (forecastResponse.success) {
        setForecast(forecastResponse.data.forecast || []);
      }

      if (insightsResponse.success) {
        setInsights(insightsResponse.data.insights);
      }

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Weather data fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  const refreshData = useCallback(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const dismissAlert = useCallback((alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  }, []);

  const getAlertsByType = useCallback((type) => {
    return alerts.filter(alert => alert.type === type);
  }, [alerts]);

  const getAlertsBySeverity = useCallback((severity) => {
    return alerts.filter(alert => alert.severity === severity);
  }, [alerts]);

  const hasActiveAlerts = alerts.length > 0;
  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'severe' || alert.severity === 'extreme'
  );

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && location?.lat && location?.lon) {
      const interval = setInterval(fetchWeatherData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchWeatherData, location]);

  // Initial data fetch
  useEffect(() => {
    if (location?.lat && location?.lon) {
      fetchWeatherData();
    }
  }, [fetchWeatherData, location]);

  // Browser notification for critical alerts
  useEffect(() => {
    if (enableNotifications && criticalAlerts.length > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        criticalAlerts.forEach(alert => {
          new Notification(`🚨 Weather Alert - ${alert.type}`, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: `weather-alert-${alert.id}`
          });
        });
      }
    }
  }, [criticalAlerts, enableNotifications]);

  return {
    // Data
    alerts,
    weatherData,
    forecast,
    insights,
    lastUpdated,
    
    // State
    isLoading,
    error,
    hasActiveAlerts,
    criticalAlerts,
    
    // Actions
    refreshData,
    dismissAlert,
    getAlertsByType,
    getAlertsBySeverity,
    
    // Utils
    fetchWeatherData
  };
};

export default useWeatherAlerts;
