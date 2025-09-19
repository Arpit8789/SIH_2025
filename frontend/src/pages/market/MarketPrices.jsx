// src/pages/market/MarketPrices.jsx - MAIN MARKET INTELLIGENCE PAGE
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/useLanguage';
import { useMarketData } from '@/hooks/useMarketData';

// Import all our components
import CropSelector from '@/pages/market/CropSelector';
import PriceCard from '@/pages/market/PriceCard';
import RecommendationCard from '@/pages/market/RecommendationCard';
import QuickStats from '@/pages/market/QuickStats';
import MarketTips from '@/pages/market/MarketTips';
import PriceTrendChart from '@/components/charts/PriceTrendChart';

// Import data files
import cropsData from '@/data/crops1.json'; // ✅ UPDATED FILE NAME
import statesData from '@/data/states.json';

const MarketPrices = () => {
  const { currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    marketData,
    loading,
    error,
    lastUpdated,
    fetchMarketData,
    refreshData,
    hasData
  } = useMarketData();

  // Get initial values from URL params or defaults
  const [selections, setSelections] = useState({
    crop: searchParams.get('crop') || '',
    state: searchParams.get('state') || 'punjab',
    market: searchParams.get('market') || 'ludhiana'
  });

  // Handle selection changes
  const handleSelectionChange = (newSelections) => {
    setSelections(newSelections);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newSelections.crop) params.set('crop', newSelections.crop);
    if (newSelections.state) params.set('state', newSelections.state);
    if (newSelections.market) params.set('market', newSelections.market);
    setSearchParams(params);
  };

  // Handle search
  const handleSearch = (searchSelections) => {
    if (searchSelections.crop && searchSelections.state) {
      fetchMarketData(searchSelections.crop, searchSelections.state, searchSelections.market);
    }
  };

  // Auto-search on component mount if params exist
  useEffect(() => {
    if (selections.crop && selections.state) {
      fetchMarketData(selections.crop, selections.state, selections.market);
    }
  }, []); // Only run once on mount

  // Generate quick stats from market data
  const generateQuickStats = () => {
    if (!hasData) return null;

    const historicalPrices = marketData.historicalData || [];
    const prices = historicalPrices.map(d => d.modalPrice).filter(p => p > 0);
    
    if (prices.length === 0) return null;

    return {
      weeklyHigh: Math.max(...prices.slice(-7)),
      weeklyLow: Math.min(...prices.slice(-7)),
      monthlyAvg: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      volatility: marketData.volatility || 0,
      insights: marketData.insights || []
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Crop Selector */}
        <CropSelector
          selectedCrop={selections.crop}
          selectedState={selections.state}
          selectedMarket={selections.market}
          onSelectionChange={handleSelectionChange}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error} - {currentLanguage === 'hi' ? 'कृपया पुनः प्रयास करें' : 'Please try again'}
            </AlertDescription>
          </Alert>
        )}

        {/* Market Data Display */}
        {hasData && (
          <>
            {/* Price Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PriceCard
                title={currentLanguage === 'hi' ? 'न्यूनतम मूल्य' : 'Minimum Price'}
                price={marketData.current?.minPrice}
                type="min"
                icon="📉"
              />
              <PriceCard
                title={currentLanguage === 'hi' ? 'मॉडल मूल्य' : 'Modal Price'}
                price={marketData.current?.modalPrice}
                trend={marketData.trend?.trend}
                change={parseFloat(marketData.trend?.percentChange)}
                type="modal"
                icon="💰"
              />
              <PriceCard
                title={currentLanguage === 'hi' ? 'अधिकतम मूल्य' : 'Maximum Price'}
                price={marketData.current?.maxPrice}
                type="max"
                icon="📈"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Chart & Stats */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Price Trend Chart */}
                <PriceTrendChart
                  data={marketData.historicalData}
                  title={currentLanguage === 'hi' ? '30-दिन मूल्य रुझान' : '30-Day Price Trend'}
                  height={320}
                />

                {/* Quick Stats */}
                <QuickStats 
                  stats={generateQuickStats()}
                  loading={loading}
                />

                {/* Refresh Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={refreshData}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {currentLanguage === 'hi' ? 'डेटा रीफ्रेश करें' : 'Refresh Data'}
                  </Button>
                </div>
              </div>

              {/* Right Column - Recommendation & Tips */}
              <div className="space-y-6">
                
                {/* AI Recommendation */}
                <RecommendationCard
                  recommendation={marketData.recommendation?.action}
                  confidence={marketData.recommendation?.confidence}
                  reasoning={marketData.recommendation?.reason}
                  nextAction={marketData.recommendation?.nextAction}
                />

                {/* Market Tips */}
                <MarketTips
                  cropId={selections.crop}
                  seasonalAdvice={marketData.seasonalAdvice}
                  marketInsights={marketData.insights}
                />
              </div>
            </div>

            {/* Last Updated Info */}
            {lastUpdated && (
              <div className="text-center text-sm text-gray-500 bg-white/50 p-3 rounded-lg">
                {currentLanguage === 'hi' ? 'अंतिम अपडेट: ' : 'Last updated: '}
                {lastUpdated.toLocaleString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US')}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!hasData && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {currentLanguage === 'hi' ? 'बाजार की जानकारी प्राप्त करें' : 'Get Market Intelligence'}
            </h3>
            <p className="text-gray-500">
              {currentLanguage === 'hi' 
                ? 'अपनी फसल और राज्य चुनकर real-time भाव और AI सुझाव पाएं'
                : 'Select your crop and state to get real-time prices and AI recommendations'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices;
