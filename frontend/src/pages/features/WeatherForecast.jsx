// src/pages/features/WeatherForecast.jsx
import React from 'react';
import { Cloud } from 'lucide-react';
import WeatherChart from '@/components/charts/WeatherChart';
import WeatherWidget from '@/components/common/WeatherWidget';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const WeatherForecast = () => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Cloud className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">
            {currentLanguage === 'hi' ? '🌦️ मौसम पूर्वानुमान' : '🌦️ Weather Forecast'}
          </h1>
          <p className="text-muted-foreground">
            {currentLanguage === 'hi' ? 
              '7-दिन का विस्तृत मौसम पूर्वानुमान और कृषि सलाह' : 
              '7-day detailed weather forecast with agricultural advice'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WeatherWidget showForecast={false} />
        </div>
        <div className="lg:col-span-2">
          <WeatherChart height={400} />
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
