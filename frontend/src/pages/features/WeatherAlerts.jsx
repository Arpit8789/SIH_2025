// src/pages/features/WeatherAlerts.jsx
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
  BellOff,
  MapPin,
  Calendar,
  Smartphone,
  Volume2,
  RefreshCw,
  Settings,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner, { WeatherLoadingSpinner } from '@/components/common/LoadingSpinner';
import WeatherChart from '@/components/charts/WeatherChart';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { weatherService } from '@/services/weatherService';
import { farmerService } from '@/services/farmerService';
import { dateHelpers } from '@/utils/helpers';

const WeatherAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [alertSettings, setAlertSettings] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const { t } = useLanguage();
  const { user } = useAuth();
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    getUserLocationAndData();
    loadAlertSettings();
  }, []);

  const getUserLocationAndData = async () => {
    try {
      // Get user location
      let location = null;
      try {
        location = await getCurrentPosition();
        setUserLocation(location);
      } catch (error) {
        // Use profile location if GPS denied
        if (user?.location) {
          location = { 
            latitude: user.location.coordinates?.latitude,
            longitude: user.location.coordinates?.longitude,
            name: `${user.location.district}, ${user.location.state}`
          };
          setUserLocation(location);
        }
      }

      if (location) {
        await Promise.all([
          loadWeatherData(location),
          loadActiveAlerts(location),
          loadForecastData(location)
        ]);
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeatherData = async (location) => {
    try {
      const response = await weatherService.getCurrentWeather({
        latitude: location.latitude,
        longitude: location.longitude,
        includeAgricultural: true
      });
      
      if (response.success) {
        setWeatherData(response.data);
        setLastUpdated(response.data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to load current weather:', error);
    }
  };

  const loadActiveAlerts = async (location) => {
    try {
      const response = await weatherService.getWeatherAlerts({
        latitude: location.latitude,
        longitude: location.longitude,
        farmerId: user?.id,
        includeAgricultural: true
      });
      
      if (response.success) {
        setActiveAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to load weather alerts:', error);
    }
  };

  const loadForecastData = async (location) => {
    try {
      const response = await weatherService.getWeatherForecast({
        latitude: location.latitude,
        longitude: location.longitude,
        days: 7,
        includeAgricultural: true
      });
      
      if (response.success) {
        setForecastData(response.data.forecast || []);
      }
    } catch (error) {
      console.error('Failed to load forecast:', error);
    }
  };

  const loadAlertSettings = async () => {
    try {
      const response = await farmerService.getAlertSettings();
      if (response.success) {
        setAlertSettings(response.data.settings || {
          temperature: true,
          rainfall: true,
          wind: true,
          humidity: true,
          frost: true,
          hail: true,
          notifications: true,
          sms: false,
          voice: true
        });
      }
    } catch (error) {
      console.error('Failed to load alert settings:', error);
    }
  };

  const updateAlertSettings = async (newSettings) => {
    try {
      const response = await farmerService.updateAlertSettings(newSettings);
      if (response.success) {
        setAlertSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to update alert settings:', error);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      setIsLoading(true);
      getUserLocationAndData();
    }
  };

  const handleVoiceQuery = (transcript) => {
    const query = transcript.toLowerCase();
    // Process voice queries about weather
    console.log('Voice weather query:', query);
  };

  const speakAlert = (alertText) => {
    if ('speechSynthesis' in window && alertSettings.voice) {
      const utterance = new SpeechSynthesisUtterance(alertText);
      utterance.lang = t('language') === 'hi' ? 'hi-IN' : 
                      t('language') === 'pa' ? 'pa-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'minor':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'minor':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (conditionLower.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return <Sun className="h-6 w-6 text-yellow-500" />;
    return <Cloud className="h-6 w-6 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <WeatherLoadingSpinner text={t('weather.loadingAlerts')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            ⚠️ {t('weather.alertsTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            📍 {userLocation?.name || t('weather.currentLocation')} • {t('weather.lastUpdated')}: {dateHelpers.formatRelativeTime(lastUpdated)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceQuery}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Badge 
            variant={activeAlerts.length > 0 ? 'destructive' : 'success'} 
            className="px-3 py-1"
          >
            {activeAlerts.length} {t('weather.activeAlerts')}
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {activeAlerts.filter(alert => alert.severity === 'severe' || alert.severity === 'extreme').length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>{t('weather.criticalAlert')}:</strong>{' '}
                {activeAlerts.find(alert => alert.severity === 'severe' || alert.severity === 'extreme')?.message}
              </div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => speakAlert(activeAlerts.find(alert => alert.severity === 'severe')?.message)}
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {t('weather.listen')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {t('weather.activeAlerts')} ({activeAlerts.length})
                </span>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('weather.manageAlerts')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                alert.severity === 'extreme' ? 'destructive' :
                                alert.severity === 'severe' ? 'destructive' :
                                alert.severity === 'moderate' ? 'warning' : 'secondary'
                              }>
                                {alert.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {dateHelpers.formatRelativeTime(alert.issuedAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3 leading-relaxed">{alert.message}</p>
                          
                          {alert.farmingAdvice && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                              <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                🌾 {t('weather.farmingAdvice')}
                              </h5>
                              <p className="text-sm text-muted-foreground">{alert.farmingAdvice}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {t('weather.validUntil')}: {dateHelpers.formatDate(alert.validUntil, 'MMM dd, HH:mm')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.affectedAreas?.join(', ')}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => speakAlert(alert.message)}>
                                <Volume2 className="h-3 w-3 mr-1" />
                                {t('weather.listen')}
                              </Button>
                              <Button size="sm" variant="outline">
                                {t('weather.details')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    {t('weather.noActiveAlerts')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('weather.weatherConditionsNormal')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Forecast Chart */}
          <WeatherChart
            location={userLocation?.name}
            height={400}
            showForecast={true}
          />

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('weather.sevenDayForecast')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {forecastData.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm mb-2">
                      {index === 0 ? t('weather.today') : 
                       index === 1 ? t('weather.tomorrow') : 
                       dateHelpers.formatDate(day.date, 'EEE')}
                    </p>
                    
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.condition.main)}
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold">
                        {Math.round(day.temperature.maximum)}° / {Math.round(day.temperature.minimum)}°
                      </div>
                      <div className="text-muted-foreground capitalize">
                        {day.condition.description}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <Droplets className="h-3 w-3" />
                        <span>{day.precipitation.amount || 0}mm</span>
                      </div>
                      
                      {day.agriculturalData?.alerts?.length > 0 && (
                        <Badge variant="warning" className="text-xs mt-1">
                          <AlertTriangle className="h-2 w-2 mr-1" />
                          {day.agriculturalData.alerts.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Weather */}
          {weatherData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {getWeatherIcon(weatherData.current?.condition?.main)}
                  {t('weather.currentConditions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {Math.round(weatherData.current?.temperature || 0)}°C
                  </div>
                  <p className="text-muted-foreground capitalize">
                    {weatherData.current?.condition?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="space-y-1">
                    <Droplets className="h-4 w-4 mx-auto text-blue-500" />
                    <p className="text-xs text-muted-foreground">{t('weather.humidity')}</p>
                    <p className="font-medium">{weatherData.current?.humidity || 0}%</p>
                  </div>
                  <div className="space-y-1">
                    <Wind className="h-4 w-4 mx-auto text-gray-500" />
                    <p className="text-xs text-muted-foreground">{t('weather.windSpeed')}</p>
                    <p className="font-medium">{weatherData.current?.windSpeed || 0} km/h</p>
                  </div>
                  <div className="space-y-1">
                    <Eye className="h-4 w-4 mx-auto text-gray-500" />
                    <p className="text-xs text-muted-foreground">{t('weather.visibility')}</p>
                    <p className="font-medium">{weatherData.current?.visibility || 0} km</p>
                  </div>
                  <div className="space-y-1">
                    <Thermometer className="h-4 w-4 mx-auto text-red-500" />
                    <p className="text-xs text-muted-foreground">{t('weather.feelsLike')}</p>
                    <p className="font-medium">{Math.round(weatherData.current?.feelsLike || 0)}°C</p>
                  </div>
                </div>

                {weatherData.agriculturalInfo && (
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-400 flex items-center gap-1">
                      🌾 {t('weather.farmingConditions')}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>{t('weather.soilMoisture')}:</span>
                        <span className="font-medium">{weatherData.agriculturalInfo.soilMoisture}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('weather.cropStress')}:</span>
                        <Badge variant={weatherData.agriculturalInfo.cropStress === 'low' ? 'success' : 'warning'}>
                          {weatherData.agriculturalInfo.cropStress}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-primary" />
                {t('weather.alertSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: 'temperature', label: t('weather.temperatureAlerts'), icon: '🌡️' },
                  { key: 'rainfall', label: t('weather.rainfallAlerts'), icon: '🌧️' },
                  { key: 'wind', label: t('weather.windAlerts'), icon: '💨' },
                  { key: 'humidity', label: t('weather.humidityAlerts'), icon: '💧' },
                  { key: 'frost', label: t('weather.frostAlerts'), icon: '❄️' },
                  { key: 'hail', label: t('weather.hailAlerts'), icon: '🧊' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{setting.icon}</span>
                      <span className="text-sm">{setting.label}</span>
                    </div>
                    <Switch
                      checked={alertSettings[setting.key] || false}
                      onCheckedChange={(checked) => 
                        updateAlertSettings({ ...alertSettings, [setting.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <h5 className="font-medium mb-3 text-sm">{t('weather.notificationMethods')}</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">{t('weather.pushNotifications')}</span>
                    </div>
                    <Switch
                      checked={alertSettings.notifications || false}
                      onCheckedChange={(checked) => 
                        updateAlertSettings({ ...alertSettings, notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">{t('weather.voiceAlerts')}</span>
                    </div>
                    <Switch
                      checked={alertSettings.voice || false}
                      onCheckedChange={(checked) => 
                        updateAlertSettings({ ...alertSettings, voice: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('weather.monthlyStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t('weather.totalRainfall')}:</span>
                <span className="font-medium">124mm</span>
              </div>
              <div className="flex justify-between">
                <span>{t('weather.averageTemp')}:</span>
                <span className="font-medium">28°C</span>
              </div>
              <div className="flex justify-between">
                <span>{t('weather.rainyDays')}:</span>
                <span className="font-medium">8 days</span>
              </div>
              <div className="flex justify-between">
                <span>{t('weather.alertsIssued')}:</span>
                <span className="font-medium">12</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlerts;
