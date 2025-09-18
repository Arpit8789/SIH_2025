// src/components/common/WeatherWidget.jsx
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { dateHelpers, numberHelpers } from '@/utils/helpers';
import { WeatherLoadingSpinner } from './LoadingSpinner';

const WeatherWidget = ({ 
  location, 
  compact = false, 
  showForecast = false,
  className 
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const { getCurrentWeather, getForecast, isLoadingCurrent } = useWeather();
  const { t } = useLanguage();

  useEffect(() => {
    loadWeatherData();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadWeatherData = async () => {
    try {
      const data = await getCurrentWeather();
      if (data) {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const getWeatherIcon = (condition, isDay = true) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    }
    if (conditionLower.includes('cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
    
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  const getWeatherBackground = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain')) {
      return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20';
    }
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-900/20';
    }
    return 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-900/20';
  };

  if (isLoadingCurrent) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <WeatherLoadingSpinner text={t('weather.loading')} />
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('weather.unavailable')}</p>
        </CardContent>
      </Card>
    );
  }

  const current = weatherData.current;
  const condition = current?.condition?.main || 'Unknown';

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getWeatherBackground(condition)} ${className}`}>
        {getWeatherIcon(condition)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {Math.round(current?.temperature || 0)}°C
            </span>
            <Badge variant="secondary" className="text-xs">
              {current?.condition?.description}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {weatherData.location?.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${getWeatherBackground(condition)} border-sky-200 dark:border-sky-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{t('weather.current')}</span>
          <Badge variant="outline" className="text-xs">
            {dateHelpers.formatRelativeTime(weatherData.lastUpdated)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Weather Info */}
        <div className="flex items-center gap-4">
          {getWeatherIcon(condition)}
          <div className="flex-1">
            <div className="text-3xl font-bold">
              {Math.round(current?.temperature || 0)}°C
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {current?.condition?.description}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('weather.feelsLike')} {Math.round(current?.feelsLike || 0)}°C
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="text-sm font-medium">
          📍 {weatherData.location?.name}
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sky-200/50">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">
                {current?.humidity || 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                {t('weather.humidity')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">
                {current?.windSpeed || 0} km/h
              </div>
              <div className="text-xs text-muted-foreground">
                {t('weather.wind')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">
                {current?.visibility || 0} km
              </div>
              <div className="text-xs text-muted-foreground">
                {t('weather.visibility')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">☁️</span>
            <div>
              <div className="text-sm font-medium">
                {current?.cloudCover || 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                {t('weather.clouds')}
              </div>
            </div>
          </div>
        </div>

        {/* Sun Times */}
        {weatherData.sun && (
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-sky-200/50">
            <div className="flex items-center gap-1">
              <span>🌅</span>
              <span>{dateHelpers.formatDate(weatherData.sun.sunrise, 'HH:mm')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌇</span>
              <span>{dateHelpers.formatDate(weatherData.sun.sunset, 'HH:mm')}</span>
            </div>
          </div>
        )}

        {/* Agricultural Advice */}
        {weatherData.agriculturalInfo && weatherData.agriculturalInfo.length > 0 && (
          <div className="pt-3 border-t border-sky-200/50">
            <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">
              🌾 {t('weather.farmingAdvice')}
            </h4>
            <div className="space-y-1">
              {weatherData.agriculturalInfo.slice(0, 2).map((advice, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {advice.message}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
