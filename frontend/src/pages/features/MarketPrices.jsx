// src/pages/features/MarketPrices.jsx - UPDATED WITH YOUR THEME & API INTEGRATION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Calendar,
  RefreshCw,
  Sun,
  Moon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bell,
  ChevronDown,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMarketData } from '@/hooks/useMarketData';

const MarketPrices = () => {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { 
    marketData, 
    loading, 
    error, 
    fetchMarketData, 
    refreshData,
    hasData,
    currentPrice,
    trend,
    recommendation
  } = useMarketData();

  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedState, setSelectedState] = useState(user?.location || 'Punjab');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Popular crops data
  const popularCrops = [
    { id: 'wheat', name: { en: 'Wheat', hi: 'गेहूं', pa: 'ਕਣਕ' }, icon: '🌾', category: 'cereals' },
    { id: 'rice', name: { en: 'Rice', hi: 'चावल', pa: 'ਚਾਵਲ' }, icon: '🌾', category: 'cereals' },
    { id: 'maize', name: { en: 'Maize', hi: 'मक्का', pa: 'ਮੱਕੀ' }, icon: '🌽', category: 'cereals' },
    { id: 'cotton', name: { en: 'Cotton', hi: 'कपास', pa: 'ਕਪਾਹ' }, icon: '🌿', category: 'cash_crop' },
    { id: 'soybean', name: { en: 'Soybean', hi: 'सोयाबीन', pa: 'ਸੋਇਆਬੀਨ' }, icon: '🫘', category: 'oilseed' },
    { id: 'onion', name: { en: 'Onion', hi: 'प्याज', pa: 'ਪਿਆਜ਼' }, icon: '🧅', category: 'vegetable' },
    { id: 'potato', name: { en: 'Potato', hi: 'आलू', pa: 'ਆਲੂ' }, icon: '🥔', category: 'vegetable' },
    { id: 'tomato', name: { en: 'Tomato', hi: 'टमाटर', pa: 'ਟਮਾਟਰ' }, icon: '🍅', category: 'vegetable' }
  ];

  // States data
  const states = [
    { id: 'punjab', name: { en: 'Punjab', hi: 'पंजाब', pa: 'ਪੰਜਾਬ' } },
    { id: 'haryana', name: { en: 'Haryana', hi: 'हरियाणा', pa: 'ਹਰਿਆਣਾ' } },
    { id: 'uttar-pradesh', name: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', pa: 'ਉੱਤਰ ਪ੍ਰਦੇਸ਼' } },
    { id: 'madhya-pradesh', name: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', pa: 'ਮੱਧ ਪ੍ਰਦੇਸ਼' } },
    { id: 'rajasthan', name: { en: 'Rajasthan', hi: 'राजस्थान', pa: 'ਰਾਜਸਥਾਨ' } }
  ];

  // Load market data on component mount
  useEffect(() => {
    fetchMarketData(selectedCrop, selectedState, selectedMarket);
  }, [selectedCrop, selectedState, selectedMarket, fetchMarketData]);

  // Generate mock price history when market data changes
  useEffect(() => {
    if (hasData && marketData) {
      generatePriceHistory();
    }
  }, [hasData, marketData]);

  // Generate mock price history for charts
  const generatePriceHistory = () => {
    const history = [];
    const basePrice = currentPrice || 2000;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = Math.round(basePrice * (1 + variation));
      
      history.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: price,
        modalPrice: price,
        volume: Math.round(Math.random() * 1000) + 500
      });
    }
    
    setPriceHistory(history);
    setLastUpdated(new Date());
  };

  // Handle search and filters
  const handleSearch = async () => {
    await fetchMarketData(selectedCrop, selectedState, selectedMarket);
  };

  const handleRefresh = async () => {
    await refreshData();
    generatePriceHistory();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get price trend icon
  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get recommendation color
  const getRecommendationColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'sell':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'wait':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get crop display name
  const getCropName = (crop) => {
    const cropData = popularCrops.find(c => c.id === crop.id);
    return cropData?.name[currentLanguage] || cropData?.name.en || crop.name;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'dark bg-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              📈 {currentLanguage === 'hi' ? 'बाज़ार भाव' : currentLanguage === 'pa' ? 'ਬਾਜ਼ਾਰ ਦੇ ਭਾਅ' : 'Market Prices'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentLanguage === 'hi' ? 'रीयल-टाइम कृषि उत्पाद मूल्य एवं बाजार विश्लेषण' : 
               currentLanguage === 'pa' ? 'ਰੀਅਲ-ਟਾਈਮ ਖੇਤੀ ਉਤਪਾਦ ਦੇ ਭਾਅ ਅਤੇ ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ' :
               'Real-time agricultural commodity prices & market analysis'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {currentLanguage === 'hi' ? 'रीफ्रेश' : currentLanguage === 'pa' ? 'ਤਾਜ਼ਾ ਕਰੋ' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Crop Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'फसल' : currentLanguage === 'pa' ? 'ਫਸਲ' : 'Crop'}
              </label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {popularCrops.map(crop => (
                    <SelectItem key={crop.id} value={crop.id}>
                      <div className="flex items-center gap-2">
                        <span>{crop.icon}</span>
                        <span>{getCropName(crop)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'राज्य' : currentLanguage === 'pa' ? 'ਰਾਜ' : 'State'}
              </label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name[currentLanguage] || state.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Market Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === 'hi' ? 'मंडी' : currentLanguage === 'pa' ? 'ਮੰਡੀ' : 'Market'}
              </label>
              <Input
                placeholder={currentLanguage === 'hi' ? 'मंडी का नाम' : currentLanguage === 'pa' ? 'ਮੰਡੀ ਦਾ ਨਾਮ' : 'Market name'}
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {currentLanguage === 'hi' ? 'खोज रहे हैं...' : currentLanguage === 'pa' ? 'ਖੋਜ ਰਹੇ ਹਾਂ...' : 'Searching...'}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {currentLanguage === 'hi' ? 'खोजें' : currentLanguage === 'pa' ? 'ਖੋਜੋ' : 'Search'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Market Data Display */}
        {hasData && marketData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Price Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Prices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Minimum Price */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {currentLanguage === 'hi' ? 'न्यूनतम मूल्य' : currentLanguage === 'pa' ? 'ਘੱਟੋ-ਘੱਟ ਕੀਮਤ' : 'Minimum Price'}
                      </span>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-800 dark:text-green-300">
                      {formatCurrency(marketData.current?.minPrice || currentPrice * 0.9)}/quintal
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {currentLanguage === 'hi' ? 'बाजार न्यूनतम' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਘੱਟੋ-ਘੱਟ' : 'Market Minimum'}
                    </div>
                  </CardContent>
                </Card>

                {/* Modal Price */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {currentLanguage === 'hi' ? 'औसत मूल्य' : currentLanguage === 'pa' ? 'ਔਸਤ ਕੀਮਤ' : 'Modal Price'}
                      </span>
                      {getTrendIcon(trend)}
                    </div>
                    <div className="text-xl font-bold text-blue-800 dark:text-blue-300">
                      {formatCurrency(currentPrice)}/quintal
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {currentLanguage === 'hi' ? 'मुख्य बाजार दर' : currentLanguage === 'pa' ? 'ਮੁੱਖ ਮਾਰਕੀਟ ਰੇਟ' : 'Main Market Rate'}
                    </div>
                  </CardContent>
                </Card>

                {/* Maximum Price */}
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                        {currentLanguage === 'hi' ? 'अधिकतम मूल्य' : currentLanguage === 'pa' ? 'ਵੱਧ ਤੋਂ ਵੱਧ ਕੀਮਤ' : 'Maximum Price'}
                      </span>
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-xl font-bold text-orange-800 dark:text-orange-300">
                      {formatCurrency(marketData.current?.maxPrice || currentPrice * 1.1)}/quintal
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {currentLanguage === 'hi' ? 'बाजार अधिकतम' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਵੱਧ ਤੋਂ ਵੱਧ' : 'Market Maximum'}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Price Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      {currentLanguage === 'hi' ? '30-दिन का मूल्य रुझान' : 
                       currentLanguage === 'pa' ? '30-ਦਿਨ ਦੇ ਭਾਅ ਦਾ ਰੁਝਾਨ' : 
                       '30-Day Price Trend'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                        <XAxis dataKey="date" className="dark:fill-gray-400" />
                        <YAxis className="dark:fill-gray-400" />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value), 'Price']}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ fill: '#10b981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selling Recommendation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-400 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {currentLanguage === 'hi' ? 'बिक्री सुझाव' : currentLanguage === 'pa' ? 'ਵੇਚਣ ਦੀ ਸਲਾਹ' : 'Selling Recommendation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {marketData.recommendation ? (
                      <>
                        <div className={`text-center p-3 rounded-xl mb-3 border ${getRecommendationColor(marketData.recommendation.action)}`}>
                          <div className="text-2xl mb-1">
                            {marketData.recommendation.action === 'sell' ? '✅' : 
                             marketData.recommendation.action === 'hold' ? '⏳' : '⏸️'}
                          </div>
                          <div className="font-bold text-sm">
                            {currentLanguage === 'hi' ? 
                              (marketData.recommendation.action === 'sell' ? 'अभी बेचें' : 
                               marketData.recommendation.action === 'hold' ? 'रुकें' : 'प्रतीक्षा करें') :
                             currentLanguage === 'pa' ?
                              (marketData.recommendation.action === 'sell' ? 'ਹੁਣ ਵੇਚੋ' : 
                               marketData.recommendation.action === 'hold' ? 'ਰੁਕੋ' : 'ਇੰਤਜ਼ਾਰ ਕਰੋ') :
                              (marketData.recommendation.action === 'sell' ? 'SELL NOW' : 
                               marketData.recommendation.action === 'hold' ? 'HOLD' : 'WAIT')}
                          </div>
                          <div className="text-xs opacity-80">
                            {marketData.recommendation.confidence}% {currentLanguage === 'hi' ? 'विश्वास' : currentLanguage === 'pa' ? 'ਭਰੋਸਾ' : 'confidence'}
                          </div>
                        </div>
                        <div className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                          <p>
                            <strong>{currentLanguage === 'hi' ? 'कारण:' : currentLanguage === 'pa' ? 'ਕਾਰਨ:' : 'Reason:'}</strong> {marketData.recommendation.reason}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        {currentLanguage === 'hi' ? 'डेटा लोड हो रहा है...' : currentLanguage === 'pa' ? 'ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading recommendation...'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      {currentLanguage === 'hi' ? 'त्वरित आंकड़े' : currentLanguage === 'pa' ? 'ਤੁਰੰਤ ਅੰਕੜੇ' : 'Quick Stats'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'hi' ? 'मौजूदा कीमत:' : currentLanguage === 'pa' ? 'ਮੌਜੂਦਾ ਕੀਮਤ:' : 'Current Price:'}
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'hi' ? 'रुझान:' : currentLanguage === 'pa' ? 'ਰੁਝਾਨ:' : 'Trend:'}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend)}
                        <span className="font-medium">
                          {currentLanguage === 'hi' ? 
                            (trend === 'rising' ? 'बढ़ रहा' : trend === 'falling' ? 'गिर रहा' : 'स्थिर') :
                           currentLanguage === 'pa' ?
                            (trend === 'rising' ? 'ਵਧ ਰਿਹਾ' : trend === 'falling' ? 'ਘਟ ਰਿਹਾ' : 'ਸਥਿਰ') :
                            trend || 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentLanguage === 'hi' ? 'अंतिम अपडेट:' : currentLanguage === 'pa' ? 'ਅਖੀਰਲਾ ਅੱਪਡੇਟ:' : 'Last Updated:'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Market Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-400">
                      💡 {currentLanguage === 'hi' ? 'बाजार युक्तियां' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਟਿਪਸ' : 'Market Tips'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-emerald-800 dark:text-emerald-200">
                      <div className="flex items-start">
                        <span className="text-emerald-600 mr-2">•</span>
                        <span>
                          {currentLanguage === 'hi' ? 'बेचने से पहले 3+ खरीदारों से तुलना करें' : 
                           currentLanguage === 'pa' ? 'ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ 3+ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਤੁਲਨਾ ਕਰੋ' :
                           'Compare 3+ buyers before selling'}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-emerald-600 mr-2">•</span>
                        <span>
                          {currentLanguage === 'hi' ? 'परिवहन और पैकेजिंग लागत जांचें' : 
                           currentLanguage === 'pa' ? 'ਆਵਾਜਾਈ ਅਤੇ ਪੈਕਜਿੰਗ ਲਾਗਤ ਵੇਖੋ' :
                           'Check transport & packaging costs'}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-emerald-600 mr-2">•</span>
                        <span>
                          {currentLanguage === 'hi' ? 'मौसमी मांग के अनुसार बेचें' : 
                           currentLanguage === 'pa' ? 'ਮੌਸਮੀ ਮੰਗ ਅਨੁਸਾਰ ਵੇਚੋ' :
                           'Sell according to seasonal demand'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Popular Crops Quick Access */}
        {!hasData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-800 text-center">
              <CardHeader>
                <CardTitle>
                  {currentLanguage === 'hi' ? 'लोकप्रिय फसलें' : currentLanguage === 'pa' ? 'ਮਸ਼ਹੂਰ ਫਸਲਾਂ' : 'Popular Crops'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularCrops.map((crop) => (
                    <motion.button
                      key={crop.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCrop(crop.id);
                        fetchMarketData(crop.id, selectedState, selectedMarket);
                      }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-600 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200"
                    >
                      <div className="text-2xl mb-2">{crop.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {getCropName(crop)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {crop.category.replace('_', ' ')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices;
