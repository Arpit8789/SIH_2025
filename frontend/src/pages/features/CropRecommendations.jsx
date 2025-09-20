// src/pages/features/CropRecommendations.jsx - ENHANCED WITH LOCATION & MAP
import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Droplets,
  Thermometer,
  DollarSign,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Lightbulb,
  Sun,
  Moon,
  Navigation,
  Loader,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Database,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const CropRecommendations = () => {
  const [location, setLocation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [selectedCropType, setSelectedCropType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [analysisFactors, setAnalysisFactors] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  const { user } = useAuth();

  // Mock location data for Kharar, Mohali, Punjab
  const mockLocation = {
    latitude: 30.7516,
    longitude: 76.6464,
    city: 'Kharar',
    district: 'Mohali',
    state: 'Punjab',
    country: 'India',
    pincode: '140301',
    area: 'Kharar Tehsil'
  };

  // Mock crop recommendations data for Punjab region
  const mockCropData = {
    current: [
      {
        id: 1,
        name: 'Wheat (Winter)',
        scientificName: 'Triticum aestivum',
        emoji: '🌾',
        suitabilityScore: 92,
        profitability: 'high',
        growthPeriod: 120,
        riskLevel: 'low',
        expectedYield: 4.2,
        estimatedRevenue: 84000,
        investmentCost: 32000,
        netProfit: 52000,
        currentPrice: 2000,
        requirements: {
          water: 'Medium (450-650mm)',
          soilType: 'Loamy to Clay Loam',
          temperature: '15-25°C',
          rainfall: '500-750mm',
          fertilizer: 'NPK 120:60:40 kg/ha'
        },
        aiReasoning: 'Perfect for Punjab winter season. High demand, stable prices, and excellent soil conditions in Kharar region. Government MSP support available.',
        marketAnalysis: {
          demandLevel: 'Very High',
          priceStability: 'Stable',
          exportPotential: 'High',
          mspSupport: true
        },
        seasonalAdvice: 'Best sowing time: November-December. Harvest: April-May.'
      },
      {
        id: 2,
        name: 'Mustard (Sarson)',
        scientificName: 'Brassica juncea',
        emoji: '🌻',
        suitabilityScore: 88,
        profitability: 'high',
        growthPeriod: 90,
        riskLevel: 'low',
        expectedYield: 1.8,
        estimatedRevenue: 81000,
        investmentCost: 28000,
        netProfit: 53000,
        currentPrice: 4500,
        requirements: {
          water: 'Low to Medium (300-400mm)',
          soilType: 'Well-drained Loamy',
          temperature: '10-25°C',
          rainfall: '400-600mm',
          fertilizer: 'NPK 60:40:20 kg/ha'
        },
        aiReasoning: 'Excellent oilseed crop for Punjab. High oil content varieties suitable for local climate. Good market demand for oil and cake.',
        marketAnalysis: {
          demandLevel: 'High',
          priceStability: 'Moderate',
          exportPotential: 'Medium',
          mspSupport: true
        },
        seasonalAdvice: 'Sowing: October-November. Harvest: February-March.'
      },
      {
        id: 3,
        name: 'Potato',
        scientificName: 'Solanum tuberosum',
        emoji: '🥔',
        suitabilityScore: 85,
        profitability: 'high',
        growthPeriod: 75,
        riskLevel: 'medium',
        expectedYield: 25,
        estimatedRevenue: 125000,
        investmentCost: 55000,
        netProfit: 70000,
        currentPrice: 5000,
        requirements: {
          water: 'High (500-700mm)',
          soilType: 'Sandy Loam',
          temperature: '15-20°C',
          rainfall: '500-600mm',
          fertilizer: 'NPK 180:80:100 kg/ha'
        },
        aiReasoning: 'High-value crop with excellent returns. Punjab has good cold storage facilities. Suitable for processing industry.',
        marketAnalysis: {
          demandLevel: 'Very High',
          priceStability: 'Volatile',
          exportPotential: 'Medium',
          mspSupport: false
        },
        seasonalAdvice: 'Planting: October-November. Harvest: January-February.'
      }
    ],
    kharif: [
      {
        id: 4,
        name: 'Basmati Rice',
        scientificName: 'Oryza sativa',
        emoji: '🌾',
        suitabilityScore: 94,
        profitability: 'very_high',
        growthPeriod: 140,
        riskLevel: 'low',
        expectedYield: 3.8,
        estimatedRevenue: 152000,
        investmentCost: 45000,
        netProfit: 107000,
        currentPrice: 4000,
        requirements: {
          water: 'Very High (1200-1500mm)',
          soilType: 'Clay to Clay Loam',
          temperature: '20-35°C',
          rainfall: '1000-1500mm',
          fertilizer: 'NPK 150:75:75 kg/ha'
        },
        aiReasoning: 'Premium Basmati variety perfect for Punjab. High export value and excellent soil conditions in Mohali region.',
        marketAnalysis: {
          demandLevel: 'Very High',
          priceStability: 'Stable',
          exportPotential: 'Very High',
          mspSupport: true
        },
        seasonalAdvice: 'Transplanting: June-July. Harvest: October-November.'
      },
      {
        id: 5,
        name: 'Cotton (Bt)',
        scientificName: 'Gossypium hirsutum',
        emoji: '🌿',
        suitabilityScore: 82,
        profitability: 'high',
        growthPeriod: 180,
        riskLevel: 'medium',
        expectedYield: 5.2,
        estimatedRevenue: 104000,
        investmentCost: 38000,
        netProfit: 66000,
        currentPrice: 2000,
        requirements: {
          water: 'High (700-1000mm)',
          soilType: 'Well-drained Black Cotton',
          temperature: '25-35°C',
          rainfall: '600-1000mm',
          fertilizer: 'NPK 120:60:60 kg/ha'
        },
        aiReasoning: 'Bt cotton variety suitable for Punjab conditions. Good textile industry demand and government support.',
        marketAnalysis: {
          demandLevel: 'High',
          priceStability: 'Moderate',
          exportPotential: 'High',
          mspSupport: true
        },
        seasonalAdvice: 'Sowing: April-May. Harvest: October-December.'
      },
      {
        id: 6,
        name: 'Sugarcane',
        scientificName: 'Saccharum officinarum',
        emoji: '🎋',
        suitabilityScore: 79,
        profitability: 'high',
        growthPeriod: 365,
        riskLevel: 'medium',
        expectedYield: 70,
        estimatedRevenue: 245000,
        investmentCost: 85000,
        netProfit: 160000,
        currentPrice: 3500,
        requirements: {
          water: 'Very High (1500-2000mm)',
          soilType: 'Deep Fertile Loam',
          temperature: '26-32°C',
          rainfall: '1000-1500mm',
          fertilizer: 'NPK 300:150:150 kg/ha'
        },
        aiReasoning: 'Long-duration crop with high returns. Punjab has good sugar mills. Requires high water availability.',
        marketAnalysis: {
          demandLevel: 'High',
          priceStability: 'Stable',
          exportPotential: 'Low',
          mspSupport: true
        },
        seasonalAdvice: 'Planting: February-April. Harvest: December-March (next year).'
      }
    ],
    rabi: [
      {
        id: 7,
        name: 'Chickpea (Chana)',
        scientificName: 'Cicer arietinum',
        emoji: '🫘',
        suitabilityScore: 86,
        profitability: 'high',
        growthPeriod: 100,
        riskLevel: 'low',
        expectedYield: 2.2,
        estimatedRevenue: 110000,
        investmentCost: 35000,
        netProfit: 75000,
        currentPrice: 5000,
        requirements: {
          water: 'Low to Medium (350-500mm)',
          soilType: 'Well-drained Loamy',
          temperature: '15-25°C',
          rainfall: '400-600mm',
          fertilizer: 'NPK 20:40:20 kg/ha'
        },
        aiReasoning: 'Excellent pulse crop for Punjab. High protein content and good market demand. Nitrogen-fixing properties improve soil.',
        marketAnalysis: {
          demandLevel: 'Very High',
          priceStability: 'Moderate',
          exportPotential: 'High',
          mspSupport: true
        },
        seasonalAdvice: 'Sowing: November-December. Harvest: March-April.'
      },
      {
        id: 8,
        name: 'Barley',
        scientificName: 'Hordeum vulgare',
        emoji: '🌾',
        suitabilityScore: 83,
        profitability: 'medium',
        growthPeriod: 110,
        riskLevel: 'low',
        expectedYield: 3.5,
        estimatedRevenue: 52500,
        investmentCost: 25000,
        netProfit: 27500,
        currentPrice: 1500,
        requirements: {
          water: 'Low to Medium (400-500mm)',
          soilType: 'Well-drained Loamy',
          temperature: '12-20°C',
          rainfall: '450-650mm',
          fertilizer: 'NPK 80:40:20 kg/ha'
        },
        aiReasoning: 'Hardy crop suitable for marginal lands. Good for fodder and malting industry. Low input costs.',
        marketAnalysis: {
          demandLevel: 'Medium',
          priceStability: 'Stable',
          exportPotential: 'Low',
          mspSupport: true
        },
        seasonalAdvice: 'Sowing: November-December. Harvest: April-May.'
      }
    ]
  };

  // Monthly market trends data
  const mockMonthlyTrends = [
    {
      month: 'September 2025',
      period: 'previous',
      crops: [
        { name: 'Rice', price: 2800, change: -5.2, trend: 'falling', volume: 12500 },
        { name: 'Cotton', price: 1950, change: 2.8, trend: 'rising', volume: 8300 },
        { name: 'Sugarcane', price: 3400, change: 0.5, trend: 'stable', volume: 15600 }
      ]
    },
    {
      month: 'October 2025',
      period: 'current',
      crops: [
        { name: 'Wheat', price: 2000, change: 4.2, trend: 'rising', volume: 18700 },
        { name: 'Mustard', price: 4500, change: 8.1, trend: 'rising', volume: 6800 },
        { name: 'Potato', price: 5000, change: -12.3, trend: 'falling', volume: 9200 }
      ]
    },
    {
      month: 'November 2025',
      period: 'next',
      crops: [
        { name: 'Wheat', price: 2100, change: 5.0, trend: 'rising', volume: 19500 },
        { name: 'Chickpea', price: 5200, change: 4.0, trend: 'rising', volume: 7300 },
        { name: 'Barley', price: 1580, change: 5.3, trend: 'rising', volume: 4200 }
      ]
    }
  ];

  // Mock analysis factors
  const mockAnalysisFactors = {
    climateScore: 88,
    soilScore: 92,
    waterScore: 75,
    marketScore: 85,
    weatherCondition: 'Favorable',
    soilType: 'Alluvial Loam',
    rainfallStatus: 'Adequate',
    temperatureRange: '15-28°C'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      setLocation(mockLocation);
      setRecommendations(mockCropData);
      setMonthlyTrends(mockMonthlyTrends);
      setAnalysisFactors(mockAnalysisFactors);
      setIsLoading(false);
    }, 2000);
  };

  const getCurrentCrops = () => {
    if (selectedTimeframe === 'current') return recommendations.current || [];
    if (selectedTimeframe === 'kharif') return recommendations.kharif || [];
    if (selectedTimeframe === 'rabi') return recommendations.rabi || [];
    return [];
  };

  const getFilteredCrops = () => {
    let crops = getCurrentCrops();
    if (selectedCropType !== 'all') {
      crops = crops.filter(crop => {
        if (selectedCropType === 'cereals') return ['wheat', 'rice', 'barley'].some(c => crop.name.toLowerCase().includes(c));
        if (selectedCropType === 'pulses') return ['chickpea', 'chana'].some(c => crop.name.toLowerCase().includes(c));
        if (selectedCropType === 'oilseeds') return ['mustard', 'sarson'].some(c => crop.name.toLowerCase().includes(c));
        if (selectedCropType === 'cash') return ['cotton', 'sugarcane', 'potato'].some(c => crop.name.toLowerCase().includes(c));
        return true;
      });
    }
    return crops;
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend === 'falling') return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getSuitabilityColor = (score) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const timeframes = [
    { value: 'current', label: 'Current Season (Rabi)', icon: '🌾' },
    { value: 'kharif', label: 'Kharif Season', icon: '🌾' },
    { value: 'rabi', label: 'Rabi Season', icon: '🌻' }
  ];

  const cropTypes = [
    { value: 'all', label: 'All Crops' },
    { value: 'cereals', label: 'Cereals' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'oilseeds', label: 'Oilseeds' },
    { value: 'cash', label: 'Cash Crops' }
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <div className="relative">
                <Leaf className="h-10 w-10 text-green-600 dark:text-green-400 animate-pulse" />
                <Navigation className="h-4 w-4 text-blue-500 absolute -top-1 -right-1 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">🌾 Analyzing Your Farm Location</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Fetching location data and crop recommendations...</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Detecting: Kharar, Mohali, Punjab</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🌾 Smart Crop Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              AI-powered recommendations for your location
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
            <Badge className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
              🤖 AI Powered
            </Badge>
          </div>
        </div>

        {/* Location Card with Map */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              Your Farm Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <Navigation className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Detected Location</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location.city}, {location.district}, {location.state}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      📍 {location.latitude}°N, {location.longitude}°E
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-600 dark:text-blue-400 font-medium">District</p>
                    <p className="text-gray-900 dark:text-gray-100">{location.district}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-purple-600 dark:text-purple-400 font-medium">PIN Code</p>
                    <p className="text-gray-900 dark:text-gray-100">{location.pincode}</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-orange-600 dark:text-orange-400 font-medium">Area</p>
                    <p className="text-gray-900 dark:text-gray-100">{location.area}</p>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <p className="text-teal-600 dark:text-teal-400 font-medium">State</p>
                    <p className="text-gray-900 dark:text-gray-100">{location.state}</p>
                  </div>
                </div>
              </div>

              {/* Map Visualization */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 text-center border border-blue-200 dark:border-blue-700">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Interactive Map</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your farm is located in the fertile plains of Punjab
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <p className="text-gray-500 dark:text-gray-400">Latitude</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">{location.latitude}°</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <p className="text-gray-500 dark:text-gray-400">Longitude</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">{location.longitude}°</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Location Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Farm Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Climate Score</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisFactors.climateScore}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{analysisFactors.weatherCondition}</p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                <Leaf className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Soil Quality</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisFactors.soilScore}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{analysisFactors.soilType}</p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Water Availability</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysisFactors.waterScore}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{analysisFactors.rainfallStatus}</p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <DollarSign className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Market Potential</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisFactors.marketScore}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{analysisFactors.temperatureRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              Customize Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Season/Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((timeframe) => (
                      <SelectItem key={timeframe.value} value={timeframe.value}>
                        <div className="flex items-center gap-2">
                          <span>{timeframe.icon}</span>
                          {timeframe.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Crop Type</label>
                <Select value={selectedCropType} onValueChange={setSelectedCropType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="recommendations" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              🌾 Crop Recommendations ({getFilteredCrops().length})
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              📈 Market Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {getFilteredCrops().map((crop, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{crop.emoji}</div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">{crop.name}</CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{crop.scientificName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getSuitabilityColor(crop.suitabilityScore)}`}>
                          {crop.suitabilityScore}/100
                        </div>
                        <Badge variant={crop.suitabilityScore >= 85 ? 'default' : crop.suitabilityScore >= 70 ? 'secondary' : 'destructive'} className={crop.suitabilityScore >= 85 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}>
                          {crop.suitabilityScore >= 85 ? 'Excellent' : crop.suitabilityScore >= 70 ? 'Good' : 'Fair'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Suitability Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 dark:text-gray-300">Overall Suitability</span>
                        <span className="text-gray-700 dark:text-gray-300">{crop.suitabilityScore}%</span>
                      </div>
                      <Progress value={crop.suitabilityScore} className="h-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="text-lg mb-1">
                          {crop.profitability === 'very_high' ? '💰💰' : 
                           crop.profitability === 'high' ? '💰' : 
                           crop.profitability === 'medium' ? '💸' : '💴'}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Profitability</p>
                        <p className="font-semibold text-sm capitalize text-gray-900 dark:text-gray-100">
                          {crop.profitability.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="text-lg mb-1">⏱️</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Growth Period</p>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{crop.growthPeriod} days</p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="text-lg mb-1">
                          {crop.riskLevel === 'low' ? '🟢' : 
                           crop.riskLevel === 'medium' ? '🟡' : '🔴'}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                        <p className="font-semibold text-sm capitalize text-gray-900 dark:text-gray-100">{crop.riskLevel}</p>
                      </div>
                    </div>

                    {/* Financial Projections */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Financial Projection (per acre)
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Expected Yield</p>
                          <p className="font-bold text-green-600 dark:text-green-400">{crop.expectedYield} tons</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                          <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(crop.currentPrice)}/ton</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                          <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(crop.estimatedRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Investment</p>
                          <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(crop.investmentCost)}</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-gray-600 dark:text-gray-400">Net Profit</p>
                          <p className="font-bold text-xl text-purple-600 dark:text-purple-400">{formatCurrency(crop.netProfit)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                        className="w-full mb-3"
                      >
                        {expandedCard === index ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                        {expandedCard === index ? 'Hide Details' : 'Show Details'}
                      </Button>
                      
                      {expandedCard === index && (
                        <div className="space-y-4 animate-in slide-in-from-top duration-300">
                          {/* Key Requirements */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Growing Requirements</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">💧 Water Need:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{crop.requirements?.water}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">🌡️ Temperature:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{crop.requirements?.temperature}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">🌱 Soil Type:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{crop.requirements?.soilType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">🌧️ Rainfall:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{crop.requirements?.rainfall}</span>
                                </div>
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">🧪 Fertilizer:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{crop.requirements?.fertilizer}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Market Analysis */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-400">Market Analysis</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Demand Level</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{crop.marketAnalysis?.demandLevel}</p>
                              </div>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Price Stability</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{crop.marketAnalysis?.priceStability}</p>
                              </div>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Export Potential</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{crop.marketAnalysis?.exportPotential}</p>
                              </div>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">MSP Support</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {crop.marketAnalysis?.mspSupport ? '✅ Available' : '❌ Not Available'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* AI Reasoning */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-1">
                              🤖 AI Analysis
                            </h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed mb-3">
                              {crop.aiReasoning}
                            </p>
                            <div className="bg-white dark:bg-gray-800 rounded p-3 border border-purple-300 dark:border-purple-600">
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Seasonal Advice:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{crop.seasonalAdvice}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Select Crop
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Get Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getFilteredCrops().length === 0 && (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No crops found for selected filters
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your season or crop type selection
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="space-y-6">
              {monthlyTrends.map((monthData, monthIndex) => (
                <Card key={monthIndex} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                        {monthData.month}
                      </div>
                      <Badge variant={monthData.period === 'current' ? 'default' : 'secondary'} className={monthData.period === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}>
                        {monthData.period === 'previous' ? '📅 Previous' : 
                         monthData.period === 'current' ? '📍 Current' : '🔮 Forecast'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {monthData.crops.map((crop, cropIndex) => (
                        <div key={cropIndex} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{crop.name}</h4>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(crop.trend)}
                              <span className={`text-sm font-medium ${
                                crop.trend === 'rising' ? 'text-green-600 dark:text-green-400' :
                                crop.trend === 'falling' ? 'text-red-600 dark:text-red-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {crop.change > 0 ? '+' : ''}{crop.change}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Price:</span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(crop.price)}/ton</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{crop.volume.toLocaleString()} tons</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                              <Badge variant={crop.trend === 'rising' ? 'default' : crop.trend === 'falling' ? 'destructive' : 'secondary'} className={crop.trend === 'rising' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}>
                                {crop.trend.charAt(0).toUpperCase() + crop.trend.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <Progress 
                              value={Math.abs(crop.change) * 5} 
                              className={`h-2 ${crop.trend === 'rising' ? 'text-green-500' : crop.trend === 'falling' ? 'text-red-500' : 'text-gray-500'}`} 
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Market activity: {Math.abs(crop.change) > 10 ? 'High' : Math.abs(crop.change) > 5 ? 'Medium' : 'Low'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CropRecommendations;
