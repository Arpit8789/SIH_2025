// src/pages/features/WeatherAlerts.jsx - DARK MODE SUPPORT + NO DEFAULT LOCATION
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Bell,
  MapPin,
  Calendar,
  RefreshCw,
  Volume2,
  Shield,
  TrendingUp,
  Gauge,
  CloudSnow,
  Activity,
  Sunrise,
  Sunset,
  Navigation,
  Compass
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WeatherAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTab, setSelectedTab] = useState('alerts');

  // Mohali coordinates (no mention of "default")
  const fallbackLocation = { lat: 30.6793, lon: 76.7284 };

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserLocation(location);
          loadWeatherData(location);
        },
        (error) => {
          console.warn('Geolocation failed:', error.message);
          setUserLocation(fallbackLocation);
          loadWeatherData(fallbackLocation);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setUserLocation(fallbackLocation);
      loadWeatherData(fallbackLocation);
    }
  };

  const loadWeatherData = async (location = userLocation) => {
    if (!location?.lat || !location?.lon) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all weather data from REAL APIs
      const [currentResponse, forecastResponse, insightsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/weather/current?lat=${location.lat}&lon=${location.lon}`),
        fetch(`${API_BASE_URL}/weather/forecast?lat=${location.lat}&lon=${location.lon}&days=7`),
        fetch(`${API_BASE_URL}/weather/insights?lat=${location.lat}&lon=${location.lon}`)
      ]);

      // Parse responses
      const currentData = await currentResponse.json();
      const forecastResponseData = await forecastResponse.json();
      const insightsData = await insightsResponse.json();

      if (!currentData.success) {
        throw new Error(currentData.message || 'Failed to fetch current weather');
      }

      if (!forecastResponseData.success) {
        throw new Error(forecastResponseData.message || 'Failed to fetch weather forecast');
      }

      // Set weather data
      setWeatherData(currentData.data.current.current);
      setActiveAlerts(currentData.data.alerts || []);
      setUserLocation({
        ...location,
        name: currentData.data.location?.farmerLocation || 'Your Location'
      });

      // Set 7-day forecast data
      setForecastData(forecastResponseData.data.forecast || []);

      // Set AI insights if available
      if (insightsData.success) {
        setInsights(insightsData.data.insights);
      }

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Weather API Error:', err);
      setError(err.message || 'Failed to load weather data. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadWeatherData();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-900 dark:text-red-100 shadow-red-100 dark:shadow-red-900/20';
      case 'moderate':
      case 'high':
        return 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-900 dark:text-orange-100 shadow-orange-100 dark:shadow-orange-900/20';
      case 'low':
      case 'minor':
        return 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-900 dark:text-yellow-100 shadow-yellow-100 dark:shadow-yellow-900/20';
      default:
        return 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-900 dark:text-blue-100 shadow-blue-100 dark:shadow-blue-900/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'moderate':
      case 'high':
        return <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      case 'low':
      case 'minor':
        return <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getWeatherIcon = (condition, size = 'h-8 w-8') => {
    const iconClass = `${size} drop-shadow-sm`;
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />;
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className={`${iconClass} text-gray-500 dark:text-gray-400`} />;
      case 'rain':
      case 'drizzle':
      case 'light rain':
        return <CloudRain className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-blue-300 dark:text-blue-200`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />;
    }
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">Weather Service Error</h2>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={refreshData}
              className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cloud className="h-8 w-8 text-green-600 dark:text-green-400 animate-pulse" />
                </div>
              </div>
              <p className="text-green-800 dark:text-green-200 font-semibold text-lg mb-2">Loading Weather Data...</p>
              <p className="text-green-600 dark:text-green-400">Fetching real-time weather information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-green-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
                  <Activity className="h-8 w-8" />
                  Weather Alert Dashboard
                </h1>
                <div className="flex items-center gap-4 text-green-100 dark:text-green-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{userLocation?.name}</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-green-300 dark:bg-green-400 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Last Updated: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 dark:bg-black dark:bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 dark:hover:bg-opacity-30 transition-all duration-300 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                selectedTab === 'alerts'
                  ? 'text-red-700 dark:text-red-400 border-b-3 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-950/50'
                  : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <AlertTriangle className="h-5 w-5" />
                  {activeAlerts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {activeAlerts.length}
                    </span>
                  )}
                </div>
                <span>Weather Alerts</span>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTab('current')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                selectedTab === 'current'
                  ? 'text-blue-700 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Gauge className="h-5 w-5" />
                <span>Current Weather</span>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTab('forecast')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                selectedTab === 'forecast'
                  ? 'text-green-700 dark:text-green-400 border-b-3 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950/50'
                  : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-5 w-5" />
                <span>7-Day Forecast</span>
              </div>
            </button>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-6">
            {selectedTab === 'alerts' && (
              <div className="space-y-6">
                {activeAlerts.length > 0 ? (
                  <>
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-2xl border-l-6 p-8 ${getSeverityColor(alert.severity)} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                      >
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 rounded-xl">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="font-bold text-xl">
                                {alert.message}
                              </h3>
                              <span className="text-sm bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 px-3 py-1 rounded-full font-medium capitalize">
                                {alert.severity} Alert
                              </span>
                            </div>
                            
                            <p className="text-base mb-4 opacity-90">
                              {alert.description}
                            </p>

                            {alert.actions && alert.actions.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                  <Shield className="h-5 w-5" />
                                  Recommended Actions:
                                </h4>
                                <ul className="space-y-2">
                                  {alert.actions.map((action, index) => (
                                    <li key={index} className="flex items-start gap-3 text-base">
                                      <span className="w-2 h-2 bg-current rounded-full mt-2.5 opacity-70"></span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white dark:border-gray-600 border-opacity-30 dark:border-opacity-30">
                              <span className="text-sm opacity-80">
                                Valid until: {alert.validUntil ? formatTime(alert.validUntil) : 'Ongoing'}
                              </span>
                              <button className="text-sm bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 px-4 py-2 rounded-lg hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                Listen
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <Shield className="h-24 w-24 text-green-300 dark:text-green-600 mx-auto" />
                      <div className="absolute inset-0 animate-ping">
                        <Shield className="h-24 w-24 text-green-200 dark:text-green-700 mx-auto opacity-20" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-3">
                      All Clear! Weather Conditions Normal
                    </h3>
                    <p className="text-green-600 dark:text-green-400 text-lg">
                      No active weather alerts for your location
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'current' && weatherData && (
              <div className="space-y-6">
                {/* Main Weather Display */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Current Weather</h2>
                      <p className="text-gray-600 dark:text-gray-300 capitalize">{weatherData.condition?.description}</p>
                    </div>
                    {getWeatherIcon(weatherData.condition?.main, 'h-16 w-16')}
                  </div>
                  
                  <div className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {Math.round(weatherData.temperature)}°C
                    <span className="text-2xl text-gray-600 dark:text-gray-300 ml-2">
                      feels like {Math.round(weatherData.feelsLike)}°C
                    </span>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-6 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Thermometer className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                      <div className="text-right">
                        <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                          {Math.round(weatherData.temperature)}°C
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Temperature</div>
                      </div>
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      Feels like {Math.round(weatherData.feelsLike)}°C
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Droplets className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                          {weatherData.humidity}%
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Humidity</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Moisture Level
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/30 dark:to-slate-800/30 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Wind className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                          {Math.round(weatherData.windSpeed)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">km/h</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Wind Speed
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Eye className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                          {weatherData.visibility || 10}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">km</div>
                      </div>
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Visibility
                    </div>
                  </div>
                </div>

                {/* Additional Weather Info */}
                {weatherData.pressure && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 p-6 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-4">
                        <Compass className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{weatherData.pressure} hPa</div>
                          <div className="text-indigo-600 dark:text-indigo-400">Atmospheric Pressure</div>
                        </div>
                      </div>
                    </div>
                    
                    {weatherData.windDirection && (
                      <div className="bg-gradient-to-r from-teal-100 to-green-100 dark:from-teal-900/30 dark:to-green-900/30 p-6 rounded-xl shadow-lg border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-4">
                          <Navigation className="h-8 w-8 text-teal-600 dark:text-teal-400" style={{ transform: `rotate(${weatherData.windDirection}deg)` }} />
                          <div>
                            <div className="text-2xl font-bold text-teal-800 dark:text-teal-200">{weatherData.windDirection}°</div>
                            <div className="text-teal-600 dark:text-teal-400">Wind Direction</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'forecast' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">7-Day Weather Forecast</h2>
                  <p className="text-gray-600 dark:text-gray-300">Plan your farming activities with detailed weather predictions</p>
                </div>

                {forecastData.length > 0 ? (
                  <div className="space-y-4">
                    {forecastData.slice(0, 7).map((day, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          {/* Date Section */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                {formatDate(day.date)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                            
                            {/* Weather Icon & Condition */}
                            <div className="flex items-center gap-3 flex-1">
                              {getWeatherIcon(day.condition?.main, 'h-10 w-10')}
                              <div>
                                <div className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                                  {day.condition?.description}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {day.condition?.main}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Temperature Section */}
                          <div className="flex items-center gap-8">
                            <div className="text-center">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                  {day.temperature?.max || '--'}°
                                </div>
                                <div className="text-lg text-gray-400 dark:text-gray-500">/</div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {day.temperature?.min || '--'}°
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">High / Low</div>
                            </div>

                            {/* Rain & Humidity */}
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                  <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                                    {day.precipitationProbability || 0}%
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Rain</div>
                              </div>

                              <div className="text-center">
                                <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  {day.humidity || '--'}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
                              </div>
                            </div>

                            {/* Farming Tip */}
                            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                {day.precipitationProbability > 60 
                                  ? '🌧️ Indoor Work'
                                  : day.temperature?.max > 35
                                  ? '🌡️ Early/Late Work'
                                  : day.temperature?.max < 10
                                  ? '❄️ Frost Protection'
                                  : '✅ Good Farm Day'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Cloud className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">7-day forecast data not available</p>
                  </div>
                )}

                {/* Weekly Summary */}
                {forecastData.length > 0 && (
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-8 shadow-lg mt-8 border border-green-200 dark:border-green-800">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Weekly Summary</h3>
                    <div className="grid md:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                          {Math.round(
                            forecastData.reduce((acc, day) => 
                              acc + ((day.temperature?.max + day.temperature?.min) / 2), 0
                            ) / forecastData.length
                          )}°C
                        </div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Avg Temperature</div>
                      </div>
                      
                      <div>
                        <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                          {forecastData.filter(day => day.precipitationProbability > 50).length}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Rainy Days</div>
                      </div>
                      
                      <div>
                        <div className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                          {forecastData.filter(day => 
                            day.precipitationProbability < 30 && day.temperature?.max < 35
                          ).length}
                        </div>
                        <div className="text-orange-600 dark:text-orange-400 font-medium">Good Farm Days</div>
                      </div>
                      
                      <div>
                        <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                          {Math.round(
                            forecastData.reduce((acc, day) => acc + (day.humidity || 0), 0) / forecastData.length
                          )}%
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 font-medium">Avg Humidity</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        {insights && selectedTab === 'alerts' && (
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-800 p-8">
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center gap-3">
              <Activity className="h-6 w-6" />
              AI Farming Insights
            </h3>
            <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 rounded-xl p-6">
              <p className="text-purple-900 dark:text-purple-100 leading-relaxed">
                {insights.weeklyPlanning || 'AI insights are being generated based on current weather conditions and forecast data.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherAlerts;
