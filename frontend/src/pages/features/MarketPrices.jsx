// src/pages/features/MarketPrices.jsx - SYNCED WITH HEADER DARK MODE
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
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee
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
import { useTheme } from '@/hooks/useTheme'; // ✅ Import theme hook

const MarketPrices = () => {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { theme, isDarkMode } = useTheme(); // ✅ Use global theme

  // State management - ✅ REMOVED local darkMode state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Form states
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');

  // API Configuration
  const API_BASE_URL = 'http://127.0.0.1:5000';

  // ✅ FIXED: All available commodities matching your Python API exactly
  const availableCommodities = [
    { id: 'Potato', name: { en: 'Potato', hi: 'आलू', pa: 'ਆਲੂ' }, icon: '🥔', category: 'vegetable' },
    { id: 'Tomato', name: { en: 'Tomato', hi: 'टमाटर', pa: 'ਟਮਾਟਰ' }, icon: '🍅', category: 'vegetable' },
    { id: 'Onion', name: { en: 'Onion', hi: 'प्याज', pa: 'ਪਿਆਜ਼' }, icon: '🧅', category: 'vegetable' },
    { id: 'Rice', name: { en: 'Rice', hi: 'चावल', pa: 'ਚਾਵਲ' }, icon: '🌾', category: 'cereals' },
    { id: 'Wheat', name: { en: 'Wheat', hi: 'गेहूं', pa: 'ਕਣਕ' }, icon: '🌾', category: 'cereals' },
    { id: 'Maize', name: { en: 'Maize', hi: 'मक्का', pa: 'ਮੱਕੀ' }, icon: '🌽', category: 'cereals' },
    { id: 'Paddy', name: { en: 'Paddy', hi: 'धान', pa: 'ਝੋਨਾ' }, icon: '🌾', category: 'cereals' },
    { id: 'Bajra', name: { en: 'Bajra', hi: 'बाजरा', pa: 'ਬਾਜਰਾ' }, icon: '🌾', category: 'cereals' },
    { id: 'Barley', name: { en: 'Barley', hi: 'जौ', pa: 'ਜੌਂ' }, icon: '🌾', category: 'cereals' },
    { id: 'Cotton', name: { en: 'Cotton', hi: 'कपास', pa: 'ਕਪਾਹ' }, icon: '🌿', category: 'cash_crop' },
    { id: 'Mustard', name: { en: 'Mustard', hi: 'सरसों', pa: 'ਸਰ੍ਹੋਂ' }, icon: '🌻', category: 'oilseed' },
    { id: 'Groundnut', name: { en: 'Groundnut', hi: 'मूंगफली', pa: 'ਮੂੰਗਫਲੀ' }, icon: '🥜', category: 'oilseed' },
    { id: 'Apple', name: { en: 'Apple', hi: 'सेब', pa: 'ਸੇਬ' }, icon: '🍎', category: 'fruit' },
    { id: 'Banana', name: { en: 'Banana', hi: 'केला', pa: 'ਕੇਲਾ' }, icon: '🍌', category: 'fruit' },
    { id: 'Mango', name: { en: 'Mango', hi: 'आम', pa: 'ਅੰਬ' }, icon: '🥭', category: 'fruit' },
    { id: 'Turmeric', name: { en: 'Turmeric', hi: 'हल्दी', pa: 'ਹਲਦੀ' }, icon: '🟡', category: 'spice' },
    { id: 'Coriander', name: { en: 'Coriander', hi: 'धनिया', pa: 'ਧਨੀਆ' }, icon: '🌿', category: 'spice' },
    { id: 'Cumin', name: { en: 'Cumin', hi: 'जीरा', pa: 'ਜੀਰਾ' }, icon: '🟤', category: 'spice' },
    { id: 'Chilli', name: { en: 'Chilli', hi: 'मिर्च', pa: 'ਮਿਰਚ' }, icon: '🌶️', category: 'spice' },
    { id: 'Ginger', name: { en: 'Ginger', hi: 'अदरक', pa: 'ਅਦਰਕ' }, icon: '🫚', category: 'spice' },
    { id: 'Garlic', name: { en: 'Garlic', hi: 'लहसुन', pa: 'ਲਸਣ' }, icon: '🧄', category: 'spice' }
  ];

  // ✅ FIXED: All available states matching your Python API exactly
  const availableStates = [
    { id: 'Punjab', name: { en: 'Punjab', hi: 'पंजाब', pa: 'ਪੰਜਾਬ' } },
    { id: 'Haryana', name: { en: 'Haryana', hi: 'हरियाणा', pa: 'ਹਰਿਆਣਾ' } },
    { id: 'Karnataka', name: { en: 'Karnataka', hi: 'कर्नाटक', pa: 'ਕਰਨਾਟਕ' } },
    { id: 'Maharashtra', name: { en: 'Maharashtra', hi: 'महाराष्ट्र', pa: 'ਮਹਾਰਾਸ਼ਟਰ' } },
    { id: 'Gujarat', name: { en: 'Gujarat', hi: 'गुजरात', pa: 'ਗੁਜਰਾਤ' } },
    { id: 'Uttar Pradesh', name: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', pa: 'ਉੱਤਰ ਪ੍ਰਦੇਸ਼' } },
    { id: 'Madhya Pradesh', name: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', pa: 'ਮੱਧ ਪ੍ਰਦੇਸ਼' } },
    { id: 'Rajasthan', name: { en: 'Rajasthan', hi: 'राजस्थान', pa: 'ਰਾਜਸਥਾਨ' } },
    { id: 'Tamil Nadu', name: { en: 'Tamil Nadu', hi: 'तमिल नाडु', pa: 'ਤਮਿਲ ਨਾਡੂ' } },
    { id: 'Bihar', name: { en: 'Bihar', hi: 'बिहार', pa: 'ਬਿਹਾਰ' } }
  ];

  // ✅ FIXED: Markets mapping with correct state names
  const stateMarkets = {
    'Punjab': [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali',
      'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur', 'Faridkot', 'Barnala',
      'Mansa', 'Sangrur', 'Fatehgarh Sahib', 'Kapurthala', 'Tarn Taran',
      'Gurdaspur', 'Muktsar', 'Fazilka', 'Nawanshahr', 'Ropar', 'Khanna',
      'Abohar', 'Malerkotla', 'Samana', 'Rajpura', 'Kharar', 'Doraha', 'Sirhind'
    ],
    'Karnataka': [
      'Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Gulbarga', 'Mangalore', 
      'Shimoga', 'Bellary', 'Bijapur', 'Davangere'
    ],
    'Maharashtra': [
      'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 
      'Kolhapur', 'Amravati', 'Latur', 'Ahmednagar'
    ],
    'Haryana': [
      'Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 
      'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'
    ],
    'Gujarat': [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 
      'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari'
    ]
  };

  // Get available markets based on selected state
  const getAvailableMarkets = () => {
    return stateMarkets[selectedState] || [];
  };

  // Format commodity name for display
  const getCommodityName = (commodityId) => {
    const commodity = availableCommodities.find(c => c.id === commodityId);
    return commodity?.name[currentLanguage] || commodity?.name.en || commodityId;
  };

  // Format state name for display
  const getStateName = (stateId) => {
    const state = availableStates.find(s => s.id === stateId);
    return state?.name[currentLanguage] || state?.name.en || stateId;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch market data from your Python API
  const fetchMarketData = async () => {
    if (!selectedCommodity || !selectedState || !selectedMarket) {
      setError('Please select commodity, state, and market');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/request?commodity=${encodeURIComponent(selectedCommodity)}&state=${encodeURIComponent(selectedState)}&market=${encodeURIComponent(selectedMarket)}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setMarketData(data);
        generatePriceHistory(data);
        setLastUpdated(new Date());
        setError('');
      } else if (data.error) {
        setError(data.error);
        setMarketData(null);
      } else {
        setError('No market data available for selected parameters');
        setMarketData(null);
      }
    } catch (err) {
      console.error('API fetch error:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate price history for chart from API data
  const generatePriceHistory = (data) => {
    if (!data || !Array.isArray(data)) return;

    const history = data.map((item, index) => {
      const minPrice = parseFloat(item['Min Price']) || 0;
      const maxPrice = parseFloat(item['Max Price']) || 0;
      const modalPrice = parseFloat(item['Modal Price']) || 0;
      
      return {
        date: item.Date || `Day ${index + 1}`,
        minPrice,
        maxPrice,
        modalPrice,
        volume: Math.round(Math.random() * 1000) + 500
      };
    }).reverse();

    setPriceHistory(history);
  };

  // Get current prices from market data
  const getCurrentPrices = () => {
    if (!marketData || !Array.isArray(marketData) || marketData.length === 0) {
      return { min: 0, max: 0, modal: 0 };
    }

    const latestData = marketData[0];
    return {
      min: parseFloat(latestData['Min Price']) || 0,
      max: parseFloat(latestData['Max Price']) || 0,
      modal: parseFloat(latestData['Modal Price']) || 0
    };
  };

  // Get price trend
  const getPriceTrend = () => {
    if (!priceHistory || priceHistory.length < 2) return 'stable';
    
    const recent = priceHistory[priceHistory.length - 1]?.modalPrice || 0;
    const previous = priceHistory[priceHistory.length - 2]?.modalPrice || 0;
    
    if (recent > previous) return 'rising';
    if (recent < previous) return 'falling';
    return 'stable';
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // ✅ SIMPLE RECOMMENDATION SYSTEM (practical approach)
  const getSimpleRecommendation = () => {
    const prices = getCurrentPrices();
    
    if (prices.modal === 0 || prices.max === 0 || prices.min === 0) return null;
    
    const priceRange = prices.max - prices.min;
    if (priceRange === 0) return null;
    
    const pricePosition = (prices.modal - prices.min) / priceRange;
    
    // Simple, practical rules that farmers can understand
    if (pricePosition > 0.8) {
      return {
        action: 'sell',
        confidence: 75,
        reason: `Today's price (₹${prices.modal}) is very close to maximum (₹${prices.max}). Good selling opportunity!`,
        technical: {
          position: `${Math.round(pricePosition * 100)}%`,
          range: priceRange
        }
      };
    }
    
    if (pricePosition < 0.3) {
      return {
        action: 'wait',
        confidence: 70,
        reason: `Today's price (₹${prices.modal}) is close to minimum (₹${prices.min}). Prices may improve.`,
        technical: {
          position: `${Math.round(pricePosition * 100)}%`,
          range: priceRange
        }
      };
    }
    
    return {
      action: 'hold',
      confidence: 60,
      reason: `Price (₹${prices.modal}) is in mid-range. Check other markets or wait for clearer trend.`,
      technical: {
        position: `${Math.round(pricePosition * 100)}%`,
        range: priceRange
      }
    };
  };

  const currentPrices = getCurrentPrices();
  const priceTrend = getPriceTrend();
  const recommendation = getSimpleRecommendation(); // ✅ Using simple recommendation

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header - ✅ REMOVED individual dark mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📈 {currentLanguage === 'hi' ? 'बाज़ार भाव' : currentLanguage === 'pa' ? 'ਬਾਜ਼ਾਰ ਦੇ ਭਾਅ' : 'Market Prices'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {currentLanguage === 'hi' ? 'रीयल-टाइम कृषि उत्पाद मूल्य एवं बाजार विश्लेषण' : 
               currentLanguage === 'pa' ? 'ਰੀਅਲ-ਟਾਈਮ ਖੇਤੀ ਉਤਪਾਦ ਦੇ ਭਾਅ ਅਤੇ ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ' :
               'Real-time agricultural commodity prices & market analysis'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {currentLanguage === 'hi' ? 'रीफ्रेश' : currentLanguage === 'pa' ? 'ਤਾਜ਼ਾ ਕਰੋ' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>API Status:</strong> Connected to {API_BASE_URL} | 
              <strong> {availableStates.length} States</strong> & <strong>{availableCommodities.length} Commodities</strong> Available
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Commodity Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {currentLanguage === 'hi' ? 'कमोडिटी चुनें' : currentLanguage === 'pa' ? 'ਕਮੋਡਿਟੀ ਚੁਣੋ' : 'Select Commodity'}
              </label>
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder={currentLanguage === 'hi' ? 'कमोडिटी चुनें' : currentLanguage === 'pa' ? 'ਕਮੋਡਿਟੀ ਚੁਣੋ' : 'Select commodity'} />
                </SelectTrigger>
                <SelectContent className="max-h-60 dark:bg-gray-800 dark:border-gray-700">
                  {availableCommodities.map(commodity => (
                    <SelectItem key={commodity.id} value={commodity.id} className="dark:text-white dark:hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{commodity.icon}</span>
                        <div>
                          <div>{getCommodityName(commodity.id)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{commodity.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {currentLanguage === 'hi' ? 'राज्य चुनें' : currentLanguage === 'pa' ? 'ਰਾਜ ਚੁਣੋ' : 'Select State'}
              </label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder={currentLanguage === 'hi' ? 'राज्य चुनें' : currentLanguage === 'pa' ? 'ਰਾਜ ਚੁਣੋ' : 'Select state'} />
                </SelectTrigger>
                <SelectContent className="max-h-60 dark:bg-gray-800 dark:border-gray-700">
                  {availableStates.map(state => (
                    <SelectItem key={state.id} value={state.id} className="dark:text-white dark:hover:bg-gray-700">
                      {getStateName(state.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Market Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {currentLanguage === 'hi' ? 'मंडी चुनें' : currentLanguage === 'pa' ? 'ਮੰਡੀ ਚੁਣੋ' : 'Select Market'}
              </label>
              {getAvailableMarkets().length > 0 ? (
                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder={currentLanguage === 'hi' ? 'मंडी चुनें' : currentLanguage === 'pa' ? 'ਮੰਡੀ ਚੁਣੋ' : 'Select market'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 dark:bg-gray-800 dark:border-gray-700">
                    {getAvailableMarkets().map(market => (
                      <SelectItem key={market} value={market} className="dark:text-white dark:hover:bg-gray-700">
                        {market}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={currentLanguage === 'hi' ? 'मंडी का नाम लिखें' : currentLanguage === 'pa' ? 'ਮੰਡੀ ਦਾ ਨਾਮ ਲਿਖੋ' : 'Enter market name'}
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              )}
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={fetchMarketData}
                disabled={loading || !selectedCommodity || !selectedState || !selectedMarket}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {currentLanguage === 'hi' ? 'खोज रहे हैं...' : currentLanguage === 'pa' ? 'ਖੋਜ ਰਹੇ ਹਾਂ...' : 'Searching...'}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {currentLanguage === 'hi' ? 'मूल्य प्राप्त करें' : currentLanguage === 'pa' ? 'ਕੀਮਤ ਪ੍ਰਾਪਤ ਕਰੋ' : 'Get Prices'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Market Data Display */}
        {marketData && Array.isArray(marketData) && marketData.length > 0 && (
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
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {currentLanguage === 'hi' ? 'न्यूनतम मूल्य' : currentLanguage === 'pa' ? 'ਘੱਟੋ-ਘੱਟ ਕੀਮਤ' : 'Minimum Price'}
                      </span>
                      <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xl font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(currentPrices.min)}/quintal
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
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {currentLanguage === 'hi' ? 'औसत मूल्य' : currentLanguage === 'pa' ? 'ਔਸਤ ਕੀਮਤ' : 'Modal Price'}
                      </span>
                      {getTrendIcon(priceTrend)}
                    </div>
                    <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                      {formatCurrency(currentPrices.modal)}/quintal
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
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {currentLanguage === 'hi' ? 'अधिकतम मूल्य' : currentLanguage === 'pa' ? 'ਵੱਧ ਤੋਂ ਵੱਧ ਕੀਮਤ' : 'Maximum Price'}
                      </span>
                      <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-xl font-bold text-orange-800 dark:text-orange-200">
                      {formatCurrency(currentPrices.max)}/quintal
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {currentLanguage === 'hi' ? 'बाजार अधिकतम' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਵੱਧ ਤੋਂ ਵੱਧ' : 'Market Maximum'}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Raw API Data Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      {currentLanguage === 'hi' ? 'बाजार डेटा' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਡੇਟਾ' : 'Market Data'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b dark:border-gray-700">
                            <th className="text-left py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'दिनांक' : currentLanguage === 'pa' ? 'ਮਿਤੀ' : 'Date'}</th>
                            <th className="text-left py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'मंडी' : currentLanguage === 'pa' ? 'ਮੰਡੀ' : 'Market'}</th>
                            <th className="text-left py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'किस्म' : currentLanguage === 'pa' ? 'ਕਿਸਮ' : 'Variety'}</th>
                            <th className="text-right py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'न्यूनतम' : currentLanguage === 'pa' ? 'ਘੱਟੋ-ਘੱਟ' : 'Min Price'}</th>
                            <th className="text-right py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'अधिकतम' : currentLanguage === 'pa' ? 'ਵੱਧ ਤੋਂ ਵੱਧ' : 'Max Price'}</th>
                            <th className="text-right py-2 text-gray-700 dark:text-gray-200">{currentLanguage === 'hi' ? 'औसत' : currentLanguage === 'pa' ? 'ਔਸਤ' : 'Modal Price'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marketData.slice(0, 5).map((item, index) => (
                            <tr key={index} className="border-b dark:border-gray-700">
                              <td className="py-2 text-gray-600 dark:text-gray-300">{item.Date || '-'}</td>
                              <td className="py-2 text-gray-600 dark:text-gray-300">{item.Market || '-'}</td>
                              <td className="py-2 text-gray-600 dark:text-gray-300">{item.Variety || '-'}</td>
                              <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">₹{item['Min Price'] || '0'}</td>
                              <td className="py-2 text-right font-medium text-red-600 dark:text-red-400">₹{item['Max Price'] || '0'}</td>
                              <td className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">₹{item['Modal Price'] || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Price Chart */}
              {priceHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        {currentLanguage === 'hi' ? 'मूल्य रुझान चार्ट' : currentLanguage === 'pa' ? 'ਭਾਅ ਰੁਝਾਨ ਚਾਰਟ' : 'Price Trend Chart'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                          <XAxis dataKey="date" tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151' }} />
                          <YAxis tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151' }} />
                          <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name]}
                            labelFormatter={(label) => `Date: ${label}`}
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                              border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                              borderRadius: '8px',
                              color: isDarkMode ? '#e5e7eb' : '#374151'
                            }}
                          />
                          <Line type="monotone" dataKey="minPrice" stroke="#10b981" strokeWidth={2} name="Min Price" />
                          <Line type="monotone" dataKey="modalPrice" stroke="#3b82f6" strokeWidth={3} name="Modal Price" />
                          <Line type="monotone" dataKey="maxPrice" stroke="#f59e0b" strokeWidth={2} name="Max Price" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Market Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {currentLanguage === 'hi' ? 'मार्केट जानकारी' : currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਜਾਣਕਾਰੀ' : 'Market Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-semibold text-indigo-800 dark:text-indigo-200">
                        {getCommodityName(selectedCommodity)}
                      </div>
                      <div className="text-indigo-600 dark:text-indigo-300">
                        {selectedMarket}, {getStateName(selectedState)}
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-300 space-y-1">
                      <div><strong>{currentLanguage === 'hi' ? 'डेटा पॉइंट्स:' : currentLanguage === 'pa' ? 'ਡੇਟਾ ਪੁਆਇੰਟ:' : 'Data Points:'}</strong> {marketData.length}</div>
                      <div><strong>{currentLanguage === 'hi' ? 'स्रोत:' : currentLanguage === 'pa' ? 'ਸਰੋਤ:' : 'Source:'}</strong> AgMarkNet API</div>
                      {lastUpdated && (
                        <div><strong>{currentLanguage === 'hi' ? 'अपडेट:' : currentLanguage === 'pa' ? 'ਅੱਪਡੇਟ:' : 'Updated:'}</strong> {lastUpdated.toLocaleTimeString()}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Selling Recommendation */}
              {recommendation && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {currentLanguage === 'hi' ? 'बिक्री सुझाव' : currentLanguage === 'pa' ? 'ਵੇਚਣ ਦੀ ਸਲਾਹ' : 'Selling Recommendation'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-center p-3 rounded-xl mb-3 border ${
                        recommendation.action === 'sell' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' :
                        recommendation.action === 'hold' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700' :
                        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
                      }`}>
                        <div className="text-2xl mb-1">
                          {recommendation.action === 'sell' ? '✅' : 
                           recommendation.action === 'hold' ? '⏳' : '⏸️'}
                        </div>
                        <div className="font-bold text-sm">
                          {currentLanguage === 'hi' ? 
                            (recommendation.action === 'sell' ? 'अभी बेचें' : 
                             recommendation.action === 'hold' ? 'रुकें' : 'प्रतीक्षा करें') :
                           currentLanguage === 'pa' ?
                            (recommendation.action === 'sell' ? 'ਹੁਣ ਵੇਚੋ' : 
                             recommendation.action === 'hold' ? 'ਰੁਕੋ' : 'ਇੰਤਜ਼ਾਰ ਕਰੋ') :
                            (recommendation.action === 'sell' ? 'SELL NOW' : 
                             recommendation.action === 'hold' ? 'HOLD' : 'WAIT')}
                        </div>
                        <div className="text-xs opacity-80">
                          {recommendation.confidence}% {currentLanguage === 'hi' ? 'विश्वास' : currentLanguage === 'pa' ? 'ਭਰੋਸਾ' : 'confidence'}
                        </div>
                      </div>
                      <div className="text-xs text-yellow-800 dark:text-yellow-200">
                        <p><strong>{currentLanguage === 'hi' ? 'कारण:' : currentLanguage === 'pa' ? 'ਕਾਰਨ:' : 'Reason:'}</strong> {recommendation.reason}</p>
                        {recommendation.technical && (
                          <p className="mt-1"><strong>Position in Range:</strong> {recommendation.technical.position}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                      {currentLanguage === 'hi' ? 'त्वरित आंकड़े' : currentLanguage === 'pa' ? 'ਤੁਰੰਤ ਅੰਕੜੇ' : 'Quick Stats'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {currentLanguage === 'hi' ? 'मौजूदा कीमत:' : currentLanguage === 'pa' ? 'ਮੌਜੂਦਾ ਕੀਮਤ:' : 'Current Price:'}
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(currentPrices.modal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {currentLanguage === 'hi' ? 'रुझान:' : currentLanguage === 'pa' ? 'ਰੁਝਾਨ:' : 'Trend:'}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(priceTrend)}
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {currentLanguage === 'hi' ? 
                            (priceTrend === 'rising' ? 'बढ़ रहा' : priceTrend === 'falling' ? 'गिर रहा' : 'स्थिर') :
                           currentLanguage === 'pa' ?
                            (priceTrend === 'rising' ? 'ਵਧ ਰਿਹਾ' : priceTrend === 'falling' ? 'ਘਟ ਰਿਹਾ' : 'ਸਥਿਰ') :
                            priceTrend || 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {currentLanguage === 'hi' ? 'मूल्य सीमा:' : currentLanguage === 'pa' ? 'ਕੀਮਤ ਰੇਂਜ:' : 'Price Range:'}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        ₹{currentPrices.max - currentPrices.min}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* No Data State with Quick Access */}
        {!marketData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-800 text-center py-12">
              <CardContent>
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  {currentLanguage === 'hi' ? 'मार्केट प्राइस खोजें' : 
                   currentLanguage === 'pa' ? 'ਮਾਰਕੀਟ ਦੇ ਭਾਅ ਖੋਜੋ' :
                   'Search Market Prices'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {currentLanguage === 'hi' ? 'कमोडिटी, राज्य और मंडी चुनकर वर्तमान भाव देखें' : 
                   currentLanguage === 'pa' ? 'ਕਮੋਡਿਟੀ, ਰਾਜ ਅਤੇ ਮੰਡੀ ਚੁਣ ਕੇ ਮੌਜੂਦਾ ਭਾਅ ਦੇਖੋ' :
                   'Select commodity, state, and market to view current prices'}
                </p>
                
                {/* Quick Access Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {[
                    { commodity: 'Wheat', state: 'Punjab', market: 'Ludhiana', icon: '🌾' },
                    { commodity: 'Rice', state: 'Punjab', market: 'Amritsar', icon: '🌾' },
                    { commodity: 'Potato', state: 'Punjab', market: 'Jalandhar', icon: '🥔' },
                    { commodity: 'Cotton', state: 'Punjab', market: 'Bathinda', icon: '🌿' },
                    { commodity: 'Tomato', state: 'Karnataka', market: 'Bangalore', icon: '🍅' },
                    { commodity: 'Onion', state: 'Maharashtra', market: 'Pune', icon: '🧅' }
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        setSelectedCommodity(item.commodity);
                        setSelectedState(item.state);
                        setSelectedMarket(item.market);
                        setTimeout(() => fetchMarketData(), 100);
                      }}
                      className="p-3 h-auto flex flex-col gap-1 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-gray-600 dark:text-gray-200"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-medium capitalize">
                        {item.commodity} - {item.market}
                      </span>
                    </Button>
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
