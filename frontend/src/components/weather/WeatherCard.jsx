// src/components/weather/WeatherCard.jsx - BEAUTIFUL WEATHER CARD COMPONENT
import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  MapPin
} from 'lucide-react';

const WeatherCard = ({ 
  weatherData, 
  location, 
  showDetails = true, 
  size = 'normal',
  className = '' 
}) => {
  if (!weatherData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border p-6 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-600';
    if (temp >= 25) return 'text-orange-600';
    if (temp >= 15) return 'text-green-600';
    return 'text-blue-600';
  };

  const cardSize = size === 'compact' ? 'p-4' : 'p-6';

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200 ${cardSize} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800 font-medium text-sm">
            {location || 'Current Location'}
          </span>
        </div>
        {getWeatherIcon(weatherData.condition?.main)}
      </div>

      {/* Main Temperature */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-baseline">
          <span className={`text-4xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
            {Math.round(weatherData.temperature)}
          </span>
          <span className="text-xl text-gray-600 ml-1">°C</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Feels like</p>
          <p className="text-lg font-semibold text-gray-700">
            {Math.round(weatherData.feelsLike)}°C
          </p>
        </div>
      </div>

      {/* Condition Description */}
      <div className="mb-4">
        <p className="text-blue-800 font-medium capitalize">
          {weatherData.condition?.description}
        </p>
        <p className="text-sm text-blue-600">
          मौसम की स्थिति अच्छी है
        </p>
      </div>

      {/* Weather Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">Humidity</span>
            <span className="font-semibold text-blue-700">
              {weatherData.humidity}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Wind</span>
            <span className="font-semibold text-gray-700">
              {weatherData.windSpeed} km/h
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-purple-500" />
            <span className="text-gray-600">Pressure</span>
            <span className="font-semibold text-purple-700">
              {weatherData.pressure} hPa
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Visibility</span>
            <span className="font-semibold text-green-700">
              {weatherData.visibility || 10} km
            </span>
          </div>
        </div>
      )}

      {/* Farming Recommendation */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">
            🌾 Farming Tip:
          </p>
          <p className="text-sm text-blue-800">
            {weatherData.temperature > 30 
              ? 'Temperature zyada hai, irrigation time pe karें'
              : weatherData.humidity > 80
              ? 'Humidity zyada hai, disease monitoring करें'
              : 'Weather conditions अच्छे हैं, normal activities continue करें'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
