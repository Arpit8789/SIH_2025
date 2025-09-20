// src/components/weather/ForecastCard.jsx - 7-DAY FORECAST COMPONENT
import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const ForecastCard = ({ forecastData, className = '' }) => {
  if (!forecastData || forecastData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border p-6 ${className}`}>
        <div className="text-center py-8">
          <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Forecast data not available</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (condition, size = 'h-6 w-6') => {
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${size} text-blue-500`} />;
      default:
        return <Sun className={`${size} text-yellow-500`} />;
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTrend = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 2) return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (diff < -2) return <TrendingDown className="h-3 w-3 text-blue-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-green-100 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">
            7-Day Weather Forecast
          </h3>
        </div>
        <p className="text-sm text-green-600">
          साप्ताहिक मौसम पूर्वानुमान - फसल की योजना बनाएं
        </p>
      </div>

      {/* Forecast List */}
      <div className="p-6 space-y-4">
        {forecastData.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 hover:shadow-md transition-shadow"
          >
            {/* Date */}
            <div className="flex-1">
              <p className="font-semibold text-green-800">
                {formatDate(day.date)}
              </p>
              <p className="text-sm text-green-600">
                {day.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Weather Icon & Condition */}
            <div className="flex-1 flex items-center gap-3">
              {getWeatherIcon(day.condition?.main)}
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {day.condition?.description}
                </p>
                <p className="text-xs text-gray-600">
                  {day.condition?.main}
                </p>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg font-bold text-red-600">
                  {day.temperature?.max || '--'}°
                </span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-lg font-bold text-blue-600">
                  {day.temperature?.min || '--'}°
                </span>
                {index > 0 && getTrend(day.temperature?.max || 0, forecastData[index-1]?.temperature?.max || 0)}
              </div>
            </div>

            {/* Rain Chance */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">
                  {day.precipitationProbability || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Rain</p>
            </div>

            {/* Humidity */}
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-gray-700">
                {day.humidity || '--'}%
              </p>
              <p className="text-xs text-gray-600">Humidity</p>
            </div>

            {/* Farming Advice */}
            <div className="flex-1 text-right">
              <div className="bg-white bg-opacity-80 rounded px-2 py-1">
                <p className="text-xs text-green-700 font-medium">
                  {day.precipitationProbability > 60 
                    ? '🌧️ Spray avoid'
                    : day.temperature?.max > 35
                    ? '🌡️ More water'
                    : '✅ Good day'
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-b-xl border-t border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-green-700 font-medium">Average Temp</p>
            <p className="text-lg font-bold text-green-800">
              {Math.round(
                forecastData.reduce((acc, day) => 
                  acc + ((day.temperature?.max + day.temperature?.min) / 2), 0
                ) / forecastData.length
              )}°C
            </p>
          </div>
          
          <div>
            <p className="text-sm text-blue-700 font-medium">Rainy Days</p>
            <p className="text-lg font-bold text-blue-800">
              {forecastData.filter(day => day.precipitationProbability > 50).length}/7
            </p>
          </div>
          
          <div>
            <p className="text-sm text-purple-700 font-medium">Best Farm Days</p>
            <p className="text-lg font-bold text-purple-800">
              {forecastData.filter(day => 
                day.precipitationProbability < 30 && 
                day.temperature?.max < 35
              ).length}/7
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-green-700">
            🌾 <strong>Weekly Farming Tip:</strong> Plan field activities on days with low rain probability and moderate temperatures
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;
