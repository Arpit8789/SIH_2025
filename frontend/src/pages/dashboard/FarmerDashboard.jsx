// src/pages/dashboard/FarmerDashboard.jsx - BEAUTIFUL INSPIRING AGRICULTURAL DASHBOARD
import React, { useState, useEffect } from 'react';
import { 
  Wheat, 
  Sprout,
  Cloud, 
  AlertTriangle, 
  Camera,
  Droplets,
  Sun,
  Wind,
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  ArrowRight,
  Leaf,
  Heart,
  Users,
  Calculator,
  MessageSquare,
  Building,
  Tractor,
  Beaker,
  TreePine,
  Flower2,
  Apple,
  Microscope,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AIWeatherAdvisory from '@/components/weather/AIWeatherAdvisory';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { weatherService } from '@/services/weatherService';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  console.log('🌾 FarmerDashboard: Component rendered/mounted');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('🌾 FarmerDashboard: useEffect - Component fully loaded');
    loadDashboardData();
    return () => {
      console.log('🌾 FarmerDashboard: Component unmounting');
    };
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadWeatherData(),
        loadCropData(),
        loadAlerts()
      ]);

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real API functions
  const loadWeatherData = async () => {
    try {
      setWeatherData({
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy'
      });
    } catch (error) {
      console.error('❌ Weather data loading failed:', error);
    }
  };

  const loadCropData = async () => {
    try {
      setCropData([]);
    } catch (error) {
      console.error('❌ Crop data loading failed:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      setWeatherAlerts([]);
    } catch (error) {
      console.error('❌ Alerts data loading failed:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || (currentLanguage === 'hi' ? 'किसान जी' : 'Farmer');
    
    if (hour < 12) {
      return currentLanguage === 'hi' ? `सुप्रभात, ${name}!` : `Good Morning, ${name}!`;
    } else if (hour < 17) {
      return currentLanguage === 'hi' ? `नमस्कार, ${name}!` : `Good Afternoon, ${name}!`;
    } else {
      return currentLanguage === 'hi' ? `शुभ संध्या, ${name}!` : `Good Evening, ${name}!`;
    }
  };

  // Inspirational messages
  // Just replace the getInspirationMessage function with this fixed version:

// Inspirational messages - FIXED
const getInspirationMessage = () => {
  const hour = new Date().getHours();
  
  const messages = {
    hi: {
      morning: "आज भी आपकी मेहनत से धरती हरी-भरी होगी। आपका योगदान अनमोल है। 🌱",
      afternoon: "आपकी कड़ी मेहनत और समर्पण से ही देश का पेट भरता है। गर्व करें अपने काम पर! 🌾",
      evening: "दिन भर की मेहनत के बाद भी आपका जुनून कम नहीं होता। आप सच्चे योद्धा हैं! 💪"
    },
    en: {
      morning: "Every seed you plant today grows into hope for tomorrow. Your dedication feeds the world! 🌱",
      afternoon: "The sweat on your brow waters the future of our nation. You are the backbone of society! 🌾", 
      evening: "As the sun sets on another day of hard work, remember - you are cultivating dreams, not just crops! 💪"
    }
  };

  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  
  // ✅ FIX: Add fallback to prevent undefined errors
  const language = currentLanguage || 'en'; // Fallback to English
  const languageMessages = messages[language] || messages.en; // Fallback to English messages
  
  return languageMessages[timeOfDay] || messages.en[timeOfDay];
};


  // Core agricultural features
  const coreFeatures = [
    {
      id: 'weather-alerts',
      title: currentLanguage === 'hi' ? 'मौसम की भविष्यवाणी' : 'Weather Intelligence',
      subtitle: currentLanguage === 'hi' ? 'प्रकृति के साथ तालमेल बिठाएं' : 'Stay in sync with nature',
      icon: Cloud,
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      route: '/weather-alerts',
      float: true
    },
    {
      id: 'disease-detection',
      title: currentLanguage === 'hi' ? 'पौधों के डॉक्टर' : 'Plant Doctor',
      subtitle: currentLanguage === 'hi' ? 'AI की शक्ति से फसल बचाएं' : 'Heal your crops with AI power',
      icon: Microscope,
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      route: '/disease-detection',
      float: false
    },
    {
      id: 'soil-health',
      title: currentLanguage === 'hi' ? 'मिट्टी का स्वास्थ्य' : 'Soil Wellness',
      subtitle: currentLanguage === 'hi' ? 'जमीन की सेहत, फसल की खुशी' : 'Healthy soil, happy crops',
      icon: Beaker,
      gradient: 'from-amber-400 via-orange-500 to-red-600',
      route: '/soil-health',
      float: true
    },
    {
      id: 'crop-recommendations',
      title: currentLanguage === 'hi' ? 'स्मार्ट खेती' : 'Smart Farming',
      subtitle: currentLanguage === 'hi' ? 'विज्ञान से बेहतर फसल' : 'Science-backed crop choices',
      icon: Sprout,
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      route: '/crop-recommendations',
      float: false
    }
  ];

  // Quick actions for sidebar
  const quickActions = [
    {
      id: 'ai-chat',
      title: currentLanguage === 'hi' ? 'AI सलाहकार' : 'AI Advisor',
      subtitle: currentLanguage === 'hi' ? 'आपका डिजिटल मित्र' : 'Your digital companion',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      route: '/ai-chat'
    },
    {
      id: 'government-schemes',
      title: currentLanguage === 'hi' ? 'सरकारी सहायता' : 'Government Aid',
      subtitle: currentLanguage === 'hi' ? 'योजनाओं का लाभ उठाएं' : 'Access support schemes',
      icon: Building,
      color: 'from-blue-500 to-cyan-600',
      route: '/government-schemes'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl">
              <Wheat className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
              <Sparkles className="h-4 w-4 text-white m-1" />
            </div>
          </div>
          <LoadingSpinner text={currentLanguage === 'hi' ? 'आपका कृषि डैशबोर्ड तैयार हो रहा है...' : 'Preparing your agricultural dashboard...'} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950 relative overflow-hidden">
      
      {/* Floating Agricultural Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-green-200 dark:text-green-800 opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}>
          <Wheat className="h-16 w-16" />
        </div>
        <div className="absolute top-40 right-20 text-yellow-200 dark:text-yellow-800 opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }}>
          <Sun className="h-12 w-12" />
        </div>
        <div className="absolute bottom-40 left-20 text-blue-200 dark:text-blue-800 opacity-25 animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }}>
          <Droplets className="h-14 w-14" />
        </div>
        <div className="absolute bottom-20 right-40 text-green-200 dark:text-green-800 opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '9s' }}>
          <TreePine className="h-18 w-18" />
        </div>
        <div className="absolute top-60 left-1/3 text-pink-200 dark:text-pink-800 opacity-20 animate-bounce" style={{ animationDelay: '3s', animationDuration: '5s' }}>
          <Flower2 className="h-10 w-10" />
        </div>
      </div>

      <div className="relative z-10 w-full p-6 space-y-8">
        
        {/* Inspirational Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-xl border border-green-200/50">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user?.district && user?.state ? `${user.district}, ${user.state}` : 'Punjab, India'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200/30 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                {currentLanguage === 'hi' ? 'आज का प्रेरणादायक संदेश' : 'Today\'s Inspiration'}
              </h2>
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-green-700 dark:text-green-300 text-center text-lg leading-relaxed font-medium">
              {getInspirationMessage()}
            </p>
          </div>
        </div>

        {/* Critical Alerts */}
        {weatherAlerts.filter(alert => alert.severity === 'high').length > 0 && (
          <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-red-800 dark:text-red-200">
                <strong>{currentLanguage === 'hi' ? '🚨 तत्काल ध्यान दें: ' : '🚨 Urgent Attention: '}</strong>
                {weatherAlerts.find(alert => alert.severity === 'high').message}
              </span>
              <Button variant="destructive" size="sm" onClick={() => navigate('/weather-alerts')} className="shadow-lg">
                {currentLanguage === 'hi' ? 'तुरंत देखें' : 'View Now'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* AI Weather Advisory */}
        <AIWeatherAdvisory />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Core Features - Main Section */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Featured Agricultural Tools */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Tractor className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentLanguage === 'hi' ? 'आपके कृषि उपकरण' : 'Your Farming Arsenal'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card 
                      key={feature.id}
                      className={`border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden ${feature.float ? 'hover:-translate-y-2' : 'hover:scale-105'}`}
                      onClick={() => navigate(feature.route)}
                    >
                      <CardContent className={`p-8 bg-gradient-to-br ${feature.gradient} text-white relative`}>
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 opacity-20">
                          <div className={`absolute -top-6 -right-6 w-20 h-20 bg-white/30 rounded-full transition-all duration-700 ${feature.float ? 'group-hover:animate-ping' : 'group-hover:scale-110'}`}></div>
                          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/20 rounded-full group-hover:animate-pulse"></div>
                          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                        </div>
                        
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                              <IconComponent className="h-8 w-8" />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                              <ArrowRight className="h-6 w-6" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-bold text-xl group-hover:scale-105 transition-transform duration-200">{feature.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed">{feature.subtitle}</p>
                          </div>

                          <div className="pt-2">
                            <div className="w-12 h-1 bg-white/50 rounded-full group-hover:w-20 transition-all duration-500"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Crop Management Section */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 border-green-200 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-200">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Apple className="h-5 w-5 text-white" />
                  </div>
                  {currentLanguage === 'hi' ? 'आपकी फसल यात्रा' : 'Your Crop Journey'}
                  <Badge className="bg-green-600 text-white animate-pulse">
                    {cropData.length || 0} {currentLanguage === 'hi' ? 'फसलें' : 'Crops'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cropData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cropData.map((crop, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-green-200/50 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                          {crop.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">{crop.name}</h4>
                          <p className="text-sm text-green-600 dark:text-green-400">{crop.area} {currentLanguage === 'hi' ? 'एकड़' : 'acres'}</p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative mx-auto mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Sprout className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-3">
                      {currentLanguage === 'hi' ? 'अपनी कृषि यात्रा शुरू करें!' : 'Begin Your Agricultural Journey!'}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 mb-6 leading-relaxed">
                      {currentLanguage === 'hi' 
                        ? 'अपनी फसलों को जोड़ें और स्मार्ट तकनीक से बेहतर उत्पादन पाएं। हर बीज में छुपी है सफलता की कहानी।' 
                        : 'Add your crops and unlock better yields with smart technology. Every seed holds a story of success.'}
                    </p>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" onClick={() => navigate('/crop-recommendations')}>
                      <Sprout className="h-5 w-5 mr-2" />
                      {currentLanguage === 'hi' ? 'फसल जोड़ें और बढ़ें' : 'Add Crops & Grow'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Weather & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Weather Card */}
            {weatherData && (
              <Card className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white border-0 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute top-4 right-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '20s'}}>
                    <Sun className="h-8 w-8" />
                  </div>
                </div>
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Cloud className="h-6 w-6" />
                    <h3 className="font-bold text-lg">
                      {currentLanguage === 'hi' ? 'प्रकृति का मिजाज' : 'Nature\'s Mood'}
                    </h3>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold mb-2">{weatherData.temperature}°C</div>
                    <p className="text-white/90 text-lg font-medium">{weatherData.condition}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                      <p className="text-sm opacity-90">{currentLanguage === 'hi' ? 'नमी' : 'Humidity'}</p>
                      <p className="text-xl font-bold">{weatherData.humidity}%</p>
                    </div>
                    <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Wind className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm opacity-90">{currentLanguage === 'hi' ? 'हवा' : 'Wind'}</p>
                      <p className="text-xl font-bold">{weatherData.windSpeed} km/h</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm font-semibold transition-all duration-300 hover:scale-105"
                    variant="outline"
                    onClick={() => navigate('/weather-alerts')}
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    {currentLanguage === 'hi' ? 'विस्तृत जानकारी' : 'Detailed Forecast'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/30 border-purple-200 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-purple-800 dark:text-purple-200">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  {currentLanguage === 'hi' ? 'तुरंत सहायता' : 'Instant Help'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <div 
                      key={action.id}
                      className="group cursor-pointer"
                      onClick={() => navigate(action.route)}
                    >
                      <div className={`p-4 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{action.title}</h4>
                            <p className="text-white/80 text-sm">{action.subtitle}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Farmer Community */}
            <Card className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/40 border-green-300 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                  {currentLanguage === 'hi' ? 'किसान भाईचारा' : 'Farmer Brotherhood'}
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mb-4 leading-relaxed">
                  {currentLanguage === 'hi' 
                    ? 'हजारों किसान भाइयों के साथ जुड़ें और अनुभव साझा करें।' 
                    : 'Connect with thousands of farmer brothers and share experiences.'}
                </p>
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <Heart className="h-3 w-3 mr-1" />
                  {currentLanguage === 'hi' ? '50,000+ सदस्य' : '50,000+ Members'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
