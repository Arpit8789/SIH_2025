// src/pages/features/WeatherAlerts.jsx - ENHANCED WITH AI & OPEN-METEO INTEGRATION
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
  Shield,
  Brain,
  Sparkles,
  CheckCircle,
  Info
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
import AIWeatherAdvisory from '@/components/weather/AIWeatherAdvisory';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { weatherService } from '@/services/weatherService';
import { dateHelpers } from '@/utils/helpers';

const WeatherAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [alertSettings, setAlertSettings] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [regionalCrops, setRegionalCrops] = useState([]);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [error, setError] = useState(null);
  
  const { currentLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    if (isAuthenticated) {
      getUserLocationAndData();
      loadAlertSettings();
    }
  }, [isAuthenticated]);

  const getUserLocationAndData = async () => {
    setError(null);
    try {
      // Get user location from profile or GPS
      let location = null;
      if (user?.state && user?.district) {
        location = {
          state: user.state,
          district: user.district,
          name: `${user.district}, ${user.state}`
        };
        setUserLocation(location);
      }

      if (location) {
        await Promise.all([
          loadWeatherData(),
          loadActiveAlerts(),
          loadForecastData()
        ]);
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
      setError(error.message || 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      // ✅ Use our enhanced weather service with AI integration
      const response = await weatherService.getCurrentWeather();
      
      if (response.success) {
        setWeatherData(response.data);
        setLastUpdated(response.data.lastUpdated);
        setRegionalCrops(response.data.regionalCrops || []);
        
        // Extract AI advice if available
        const aiAdviceData = response.data.agriculturalInfo?.find(info => info.source === 'ai');
        if (aiAdviceData) {
          setAiAdvice({
            primaryAdvice: aiAdviceData.message,
            additionalTips: aiAdviceData.additionalTips || [],
            source: aiAdviceData.source
          });
        }
      }
    } catch (error) {
      console.error('Failed to load current weather:', error);
      setError('Weather data unavailable');
    }
  };

  const loadActiveAlerts = async () => {
    try {
      // ✅ Load alerts from our enhanced backend
      const response = await weatherService.getWeatherAlerts({
        unreadOnly: false,
        limit: 10
      });
      
      if (response.success) {
        setActiveAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to load weather alerts:', error);
    }
  };

  const loadForecastData = async () => {
    try {
      // ✅ Load 7-day forecast with agricultural insights
      const response = await weatherService.getWeatherForecast({
        days: 7
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
      // Load notification preferences
      const response = await weatherService.getNotificationPreferences();
      if (response.success) {
        setAlertSettings(response.data || {
          temperature: true,
          rainfall: true,
          wind: true,
          humidity: true,
          frost: true,
          hail: true,
          notifications: true,
          voice: true
        });
      }
    } catch (error) {
      console.log('Using default alert settings');
      setAlertSettings({
        temperature: true,
        rainfall: true,
        wind: true,
        humidity: true,
        frost: true,
        hail: true,
        notifications: true,
        voice: true
      });
    }
  };

  const updateAlertSettings = async (newSettings) => {
    try {
      setAlertSettings(newSettings);
      await weatherService.updateNotificationPreferences(newSettings);
    } catch (error) {
      console.error('Failed to update alert settings:', error);
    }
  };

  const markAlertsAsRead = async () => {
    try {
      await weatherService.markAlertsAsRead();
      setActiveAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error('Failed to mark alerts as read:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    getUserLocationAndData();
  };

  const speakAlert = (alertText) => {
    if ('speechSynthesis' in window && alertSettings.voice) {
      const utterance = new SpeechSynthesisUtterance(alertText);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low':
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
      <div className="p-6 max-w-7xl mx-auto">
        <WeatherLoadingSpinner text={currentLanguage === 'hi' ? 'मौसम डेटा लोड हो रहा है...' : 'Loading weather data...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {currentLanguage === 'hi' ? 'पुनः प्रयास' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🌦️ {currentLanguage === 'hi' ? 'मौसम अलर्ट सिस्टम' : 'Weather Alert System'}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            📍 {userLocation?.name || (currentLanguage === 'hi' ? 'आपका स्थान' : 'Your Location')}
            {lastUpdated && (
              <>
                <span>•</span>
                <span>{currentLanguage === 'hi' ? 'अपडेट:' : 'Updated:'} {dateHelpers.formatRelativeTime(lastUpdated)}</span>
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {currentLanguage === 'hi' ? 'रीफ्रेश' : 'Refresh'}
          </Button>
          <Badge 
            variant={activeAlerts.filter(a => !a.isRead).length > 0 ? 'destructive' : 'success'} 
            className="px-3 py-1"
          >
            {activeAlerts.filter(a => !a.isRead).length} {currentLanguage === 'hi' ? 'नए अलर्ट' : 'New Alerts'}
          </Badge>
        </div>
      </div>

      {/* ⭐ AI Weather Advisory Section */}
      <AIWeatherAdvisory className="mb-6" />

      {/* Critical Alerts Banner */}
      {activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>{currentLanguage === 'hi' ? '🚨 गंभीर चेतावनी:' : '🚨 Critical Alert:'}</strong>{' '}
                {activeAlerts.find(alert => alert.severity === 'critical' || alert.severity === 'high')?.message}
              </div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => speakAlert(activeAlerts.find(alert => alert.severity === 'critical' || alert.severity === 'high')?.message)}
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {currentLanguage === 'hi' ? 'सुनें' : 'Listen'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">
            {currentLanguage === 'hi' ? '🚨 अलर्ट' : '🚨 Alerts'}
          </TabsTrigger>
          <TabsTrigger value="forecast">
            {currentLanguage === 'hi' ? '📊 पूर्वानुमान' : '📊 Forecast'}
          </TabsTrigger>
          <TabsTrigger value="crops">
            {currentLanguage === 'hi' ? '🌾 फसल सलाह' : '🌾 Crop Advice'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {currentLanguage === 'hi' ? '⚙️ सेटिंग्स' : '⚙️ Settings'}
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Alerts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      {currentLanguage === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts'} ({activeAlerts.length})
                    </span>
                    {activeAlerts.filter(a => !a.isRead).length > 0 && (
                      <Button variant="outline" size="sm" onClick={markAlertsAsRead}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {currentLanguage === 'hi' ? 'सभी पढ़ें' : 'Mark All Read'}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {activeAlerts.map((alert, index) => (
                        <div key={alert._id || index} className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}>
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{alert.alertType?.replace('_', ' ').toUpperCase()} Alert</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' :
                                    alert.severity === 'medium' ? 'warning' : 'secondary'
                                  }>
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {dateHelpers.formatRelativeTime(alert.createdAt)}
                                  </span>
                                  {!alert.isRead && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm mb-3 leading-relaxed">{alert.message}</p>
                              
                              {alert.recommendations && alert.recommendations.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                                  <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                    🌾 {currentLanguage === 'hi' ? 'कृषि सलाह:' : 'Farming Advice:'}
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {alert.recommendations.slice(0, 3).map((rec, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {currentLanguage === 'hi' ? 'वैध:' : 'Valid:'} {dateHelpers.formatDate(alert.validUntil, 'MMM dd, HH:mm')}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => speakAlert(alert.message)}>
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    {currentLanguage === 'hi' ? 'सुनें' : 'Listen'}
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
                        {currentLanguage === 'hi' ? '🌟 कोई अलर्ट नहीं!' : '🌟 No Active Alerts!'}
                      </h3>
                      <p className="text-muted-foreground">
                        {currentLanguage === 'hi' ? 
                          'मौसम स्थितियां सामान्य हैं। हम आपको सूचित रखेंगे।' : 
                          'Weather conditions are normal. We\'ll keep you informed.'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Weather Sidebar */}
            <div className="space-y-6">
              {weatherData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getWeatherIcon(weatherData.current?.condition?.main)}
                      {currentLanguage === 'hi' ? 'वर्तमान मौसम' : 'Current Weather'}
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
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage === 'hi' ? 'महसूस होता है' : 'Feels like'} {Math.round(weatherData.current?.feelsLike || 0)}°C
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div className="space-y-1">
                        <Droplets className="h-4 w-4 mx-auto text-blue-500" />
                        <p className="text-xs text-muted-foreground">{currentLanguage === 'hi' ? 'नमी' : 'Humidity'}</p>
                        <p className="font-medium">{weatherData.current?.humidity || 0}%</p>
                      </div>
                      <div className="space-y-1">
                        <Wind className="h-4 w-4 mx-auto text-gray-500" />
                        <p className="text-xs text-muted-foreground">{currentLanguage === 'hi' ? 'हवा' : 'Wind'}</p>
                        <p className="font-medium">{weatherData.current?.windSpeed || 0} km/h</p>
                      </div>
                      <div className="space-y-1">
                        <Eye className="h-4 w-4 mx-auto text-gray-500" />
                        <p className="text-xs text-muted-foreground">{currentLanguage === 'hi' ? 'दृश्यता' : 'Visibility'}</p>
                        <p className="font-medium">{weatherData.current?.visibility || 10} km</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-lg">☁️</span>
                        <p className="text-xs text-muted-foreground">{currentLanguage === 'hi' ? 'बादल' : 'Clouds'}</p>
                        <p className="font-medium">{weatherData.current?.cloudCover || 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Regional Crops */}
              {regionalCrops.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      🌾 {currentLanguage === 'hi' ? 'क्षेत्रीय फसलें' : 'Regional Crops'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {regionalCrops.slice(0, 4).map((crop, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{crop.localName || crop.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {crop.waterRequirement} water requirement
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {crop.currentSeason}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <WeatherChart
            location={userLocation?.name}
            height={400}
            showForecast={true}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {currentLanguage === 'hi' ? '7-दिन का पूर्वानुमान' : '7-Day Forecast'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {forecastData.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm mb-2">
                      {index === 0 ? (currentLanguage === 'hi' ? 'आज' : 'Today') : 
                       index === 1 ? (currentLanguage === 'hi' ? 'कल' : 'Tomorrow') : 
                       dateHelpers.formatDate(day.date, 'EEE')}
                    </p>
                    
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.weatherCondition)}
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold">
                        {day.temperature.max}° / {day.temperature.min}°
                      </div>
                      <div className="text-muted-foreground capitalize">
                        {day.weatherDescription}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <Droplets className="h-3 w-3" />
                        <span>{day.precipitation.total || 0}mm</span>
                      </div>
                      
                      {day.agriculturalData?.cropRisk === 'high' && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          <AlertTriangle className="h-2 w-2 mr-1" />
                          Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crops Tab */}
        <TabsContent value="crops" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionalCrops.map((crop, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    🌾 {crop.localName || crop.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>{currentLanguage === 'hi' ? 'मौसम:' : 'Season:'}</span>
                      <Badge variant="outline">{crop.currentSeason}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{currentLanguage === 'hi' ? 'पानी की जरूरत:' : 'Water Need:'}</span>
                      <span className="capitalize text-blue-600">{crop.waterRequirement}</span>
                    </div>
                  </div>
                  
                  {aiAdvice && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">
                        🤖 AI सलाह:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {aiAdvice.primaryAdvice}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {currentLanguage === 'hi' ? 'अलर्ट सेटिंग्स' : 'Alert Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h5 className="font-medium">{currentLanguage === 'hi' ? 'मौसम अलर्ट प्रकार:' : 'Weather Alert Types:'}</h5>
                <div className="space-y-3">
                  {[
                    { key: 'temperature', label: currentLanguage === 'hi' ? 'तापमान अलर्ट' : 'Temperature Alerts', icon: '🌡️' },
                    { key: 'rainfall', label: currentLanguage === 'hi' ? 'बारिश अलर्ट' : 'Rainfall Alerts', icon: '🌧️' },
                    { key: 'wind', label: currentLanguage === 'hi' ? 'हवा अलर्ट' : 'Wind Alerts', icon: '💨' },
                    { key: 'humidity', label: currentLanguage === 'hi' ? 'नमी अलर्ट' : 'Humidity Alerts', icon: '💧' },
                    { key: 'frost', label: currentLanguage === 'hi' ? 'पाला अलर्ट' : 'Frost Alerts', icon: '❄️' },
                    { key: 'hail', label: currentLanguage === 'hi' ? 'ओला अलर्ट' : 'Hail Alerts', icon: '🧊' }
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
              </div>

              <div className="pt-4 border-t">
                <h5 className="font-medium mb-3">{currentLanguage === 'hi' ? 'सूचना विधि:' : 'Notification Methods:'}</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">{currentLanguage === 'hi' ? 'ऐप नोटिफिकेशन' : 'App Notifications'}</span>
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
                      <span className="text-sm">{currentLanguage === 'hi' ? 'आवाज अलर्ट' : 'Voice Alerts'}</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherAlerts;
