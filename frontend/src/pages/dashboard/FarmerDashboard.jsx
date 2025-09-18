// src/pages/dashboard/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Wheat, 
  TrendingUp, 
  Cloud, 
  AlertTriangle, 
  Camera,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Droplets,
  Sun,
  Wind
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WeatherWidget from '@/components/common/WeatherWidget';
import VoiceButton from '@/components/common/VoiceButton';
import PriceChart from '@/components/charts/PriceChart';
import YieldChart from '@/components/charts/YieldChart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useWeather } from '@/hooks/useWeather';
import { farmerService } from '@/services/farmerService';
import { marketService } from '@/services/marketService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [marketInsights, setMarketInsights] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [cropHealth, setCropHealth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { getCurrentWeather } = useWeather();
  const navigate = useNavigate();

  // Load dashboard data from backend
  useEffect(() => {
    loadDashboardData();
    setGreeting(getGreeting());
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Get farmer dashboard overview from backend
      const response = await farmerService.getDashboardOverview();
      
      if (response.success) {
        const data = response.data;
        setDashboardData(data.overview);
        setWeatherAlerts(data.weatherAlerts || []);
        setMarketInsights(data.marketInsights || []);
        setTodayTasks(data.todayTasks || []);
        setCropHealth(data.cropHealth || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || t('common.farmer');
    
    if (hour < 12) {
      return t('dashboard.goodMorning', { name });
    } else if (hour < 17) {
      return t('dashboard.goodAfternoon', { name });
    } else {
      return t('dashboard.goodEvening', { name });
    }
  };

  const handleVoiceCommand = async (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('weather') || lowerCommand.includes('मौसम')) {
      navigate('/weather');
    } else if (lowerCommand.includes('price') || lowerCommand.includes('भाव')) {
      navigate('/market-prices');
    } else if (lowerCommand.includes('crop') || lowerCommand.includes('फसल')) {
      navigate('/crops');
    } else if (lowerCommand.includes('disease') || lowerCommand.includes('बीमारी')) {
      navigate('/disease-detection');
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🌾 {greeting}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.farmerWelcome', { location: dashboardData.location })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceCommand}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="success" className="px-3 py-1">
            {t('dashboard.online')} ✅
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {weatherAlerts.filter(alert => alert.severity === 'high').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('dashboard.urgentAlert')}:</strong>{' '}
            {weatherAlerts.find(alert => alert.severity === 'high').message}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-red-600 underline"
              onClick={() => navigate('/weather')}
            >
              {t('dashboard.viewDetails')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('dashboard.activeCrops')}
            </CardTitle>
            <Wheat className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {dashboardData.stats.activeCrops}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.totalArea} {t('dashboard.acres')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {t('dashboard.expectedYield')}
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {numberHelpers.formatNumber(dashboardData.stats.expectedYield)} tons
            </div>
            <p className="text-xs text-green-600">
              +{dashboardData.stats.yieldImprovement}% {t('dashboard.fromLastYear')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              {t('dashboard.marketValue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {numberHelpers.formatCurrency(dashboardData.stats.estimatedValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.currentMarketRates')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {t('dashboard.pendingTasks')}
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {todayTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.dueToday')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('dashboard.todayTasks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge variant="outline">{task.priority}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  🎉 {t('dashboard.noTasksToday')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('dashboard.marketInsights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketInsights.map((insight, index) => (
                <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.cropName}</h4>
                    <Badge 
                      variant={insight.trend === 'rising' ? 'success' : 
                             insight.trend === 'falling' ? 'destructive' : 'secondary'}
                    >
                      {insight.trend === 'rising' ? '📈' : 
                       insight.trend === 'falling' ? '📉' : '➖'} {insight.changePercent}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('dashboard.currentPrice')}: {numberHelpers.formatCurrency(insight.currentPrice)}/ton
                  </p>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/market-prices')}
              >
                {t('dashboard.viewAllPrices')}
              </Button>
            </CardContent>
          </Card>

          {/* Price Chart */}
          {dashboardData.primaryCrop && (
            <PriceChart
              cropId={dashboardData.primaryCrop.id}
              cropName={dashboardData.primaryCrop.name}
              height={300}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget location={dashboardData.location} compact={false} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/disease-detection')}
              >
                <Camera className="mr-2 h-4 w-4" />
                {t('dashboard.detectDisease')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/market-prices')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('dashboard.checkPrices')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/ai-chat')}
              >
                <Activity className="mr-2 h-4 w-4" />
                {t('dashboard.askAI')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/weather')}
              >
                <Cloud className="mr-2 h-4 w-4" />
                {t('dashboard.weatherForecast')}
              </Button>
            </CardContent>
          </Card>

          {/* Crop Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-primary" />
                {t('dashboard.cropHealth')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cropHealth.map((crop, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{crop.name}</span>
                    <Badge 
                      variant={crop.healthScore >= 80 ? 'success' : 
                             crop.healthScore >= 60 ? 'warning' : 'destructive'}
                    >
                      {crop.healthScore}%
                    </Badge>
                  </div>
                  <Progress value={crop.healthScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">{crop.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                {t('dashboard.todayConditions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <Droplets className="h-6 w-6 mx-auto text-blue-500" />
                  <p className="text-sm text-muted-foreground">{t('weather.humidity')}</p>
                  <p className="font-medium">{dashboardData.weather?.humidity || 0}%</p>
                </div>
                <div className="space-y-1">
                  <Wind className="h-6 w-6 mx-auto text-gray-500" />
                  <p className="text-sm text-muted-foreground">{t('weather.windSpeed')}</p>
                  <p className="font-medium">{dashboardData.weather?.windSpeed || 0} km/h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Yield Analytics */}
      <YieldChart
        farmerId={user?.id}
        height={400}
        showProjections={true}
      />
    </div>
  );
};

export default FarmerDashboard;
