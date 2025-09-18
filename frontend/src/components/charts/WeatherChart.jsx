// src/components/charts/WeatherChart.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { Cloud, Droplets, Wind, Thermometer, Sun } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner, { WeatherLoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { weatherService } from '@/services/weatherService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';

const WeatherChart = ({ 
  location, 
  height = 400, 
  showForecast = true,
  className 
}) => {
  const [weatherData, setWeatherData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState('temperature');
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState(null);

  const { t } = useLanguage();

  const chartTypeOptions = [
    { value: 'temperature', label: t('weather.temperature'), icon: Thermometer, color: '#f59e0b' },
    { value: 'rainfall', label: t('weather.rainfall'), icon: Droplets, color: '#3b82f6' },
    { value: 'humidity', label: t('weather.humidity'), icon: Cloud, color: '#6b7280' },
    { value: 'windSpeed', label: t('weather.windSpeed'), icon: Wind, color: '#10b981' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: t('charts.next7Days') },
    { value: '14d', label: t('charts.next14Days') },
    { value: '30d', label: t('charts.nextMonth') }
  ];

  // Load weather data from backend
  useEffect(() => {
    loadWeatherData();
  }, [location, timeRange]);

  const loadWeatherData = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call backend API for weather forecast
      const response = await weatherService.getWeatherForecast({
        location,
        days: timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30,
        includeHourly: timeRange === '7d'
      });

      if (response.success) {
        // Transform backend data for chart
        const transformedData = response.data.forecast.map(item => ({
          date: item.date,
          formattedDate: dateHelpers.formatDate(item.date, 'MMM dd'),
          fullDate: dateHelpers.formatDate(item.date, 'MMM dd, yyyy'),
          temperature: item.temperature.average,
          tempMax: item.temperature.maximum,
          tempMin: item.temperature.minimum,
          rainfall: item.precipitation.amount || 0,
          humidity: item.humidity.average,
          windSpeed: item.wind.speed,
          condition: item.condition.main,
          conditionDesc: item.condition.description,
          uvIndex: item.uvIndex || 0,
          pressure: item.pressure || 0,
          // Agricultural indices from backend
          cropRisk: item.agriculturalData?.cropRisk || 'low',
          irrigationRecommended: item.agriculturalData?.irrigation || false,
          pestRisk: item.agriculturalData?.pestRisk || 'low'
        }));

        setWeatherData(transformedData);
      } else {
        throw new Error(response.message || 'Failed to load weather data');
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
      setError(error.message || t('weather.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip for weather chart
  const CustomWeatherTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-medium text-foreground mb-3">
            📅 {data.fullDate}
          </p>
          
          <div className="space-y-2">
            {/* Weather condition */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Condition:</span>
              <span className="text-sm font-medium capitalize">
                {data.conditionDesc}
              </span>
            </div>

            {/* Temperature range */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Temp Range:</span>
              <span className="text-sm font-medium">
                {data.tempMin}° - {data.tempMax}°C
              </span>
            </div>

            {/* Rainfall */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rainfall:</span>
              <span className="text-sm font-medium text-blue-600">
                {data.rainfall} mm
              </span>
            </div>

            {/* Humidity */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Humidity:</span>
              <span className="text-sm font-medium">
                {data.humidity}%
              </span>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wind:</span>
              <span className="text-sm font-medium">
                {data.windSpeed} km/h
              </span>
            </div>

            {/* Agricultural indicators */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">🌾 Farming Insights:</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Crop Risk:</span>
                <Badge 
                  variant={data.cropRisk === 'high' ? 'destructive' : 
                          data.cropRisk === 'medium' ? 'warning' : 'success'}
                  className="text-xs"
                >
                  {data.cropRisk}
                </Badge>
              </div>

              {data.irrigationRecommended && (
                <div className="flex items-center gap-2 mt-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Irrigation recommended</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentChartType = chartTypeOptions.find(option => option.value === chartType);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <WeatherLoadingSpinner text={t('weather.loadingForecast')} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-red-500 mb-2">❌ {error}</p>
            <button 
              onClick={loadWeatherData}
              className="text-primary hover:underline text-sm"
            >
              {t('common.retry')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChartComponent = () => {
    switch (chartType) {
      case 'temperature':
        return (
          <ComposedChart data={weatherData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}°C`}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomWeatherTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="tempMax"
              fill="#fef3c7"
              stroke="#f59e0b"
              fillOpacity={0.3}
              name="Max Temp"
            />
            <Area
              type="monotone"
              dataKey="tempMin"
              fill="#dbeafe"
              stroke="#3b82f6"
              fillOpacity={0.3}
              name="Min Temp"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ef4444' }}
              name="Avg Temp"
            />
          </ComposedChart>
        );

      case 'rainfall':
        return (
          <BarChart data={weatherData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}mm`}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomWeatherTooltip />} />
            <Legend />
            
            <Bar 
              dataKey="rainfall" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Rainfall (mm)"
            />
          </BarChart>
        );

      case 'humidity':
        return (
          <AreaChart data={weatherData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomWeatherTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.3}
              name="Humidity (%)"
            />
            <ReferenceLine y={60} stroke="#10b981" strokeDasharray="2 2" label="Optimal" />
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="2 2" label="High" />
          </AreaChart>
        );

      case 'windSpeed':
        return (
          <LineChart data={weatherData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value} km/h`}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomWeatherTooltip />} />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="windSpeed"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981' }}
              name="Wind Speed (km/h)"
            />
            <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="2 2" label="Caution" />
          </LineChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {React.createElement(currentChartType?.icon || Cloud, { 
                className: "h-5 w-5",
                style: { color: currentChartType?.color }
              })}
              {t('weather.forecast')} - {currentChartType?.label}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              📍 {location} • {t('weather.forecastSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" style={{ color: option.color }} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {getChartComponent()}
          </ResponsiveContainer>
        </div>

        {/* Weather insights for farmers */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
            🌾 {t('weather.farmingInsights')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>
                {weatherData.filter(d => d.irrigationRecommended).length} days need irrigation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>
                {weatherData.filter(d => d.rainfall === 0).length} clear days expected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              <span>
                Avg wind: {Math.round(weatherData.reduce((sum, d) => sum + d.windSpeed, 0) / weatherData.length)} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Data source */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          🌤️ {t('charts.dataSource')}: {t('weather.meteorologicalDepartment')} • {t('charts.lastUpdated')}: {dateHelpers.formatRelativeTime(new Date())}
        </p>
      </CardContent>
    </Card>
  );
};

export default WeatherChart;
