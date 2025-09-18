// src/pages/features/MarketPrices.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Bell,
  Star,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge, TrendBadge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner, { PriceLoadingSpinner } from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import PriceChart from '@/components/charts/PriceChart';
import { useLanguage } from '@/hooks/useLanguage';
import { useDebounce } from '@/hooks/useDebounce';
import { marketService } from '@/services/marketService';
import { cropService } from '@/services/cropService';
import { numberHelpers, dateHelpers } from '@/utils/helpers';

const MarketPrices = () => {
  const [marketData, setMarketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { t } = useLanguage();

  useEffect(() => {
    loadMarketData();
    loadPriceAlerts();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [debouncedSearch, selectedCategory, selectedState, sortBy, marketData]);

  const loadMarketData = async () => {
    setIsLoading(true);
    
    try {
      const response = await marketService.getCurrentPrices({
        includeAll: true,
        includeTrends: true
      });
      
      if (response.success) {
        setMarketData(response.data.prices);
        setLastUpdated(response.data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPriceAlerts = async () => {
    try {
      const response = await marketService.getPriceAlerts();
      if (response.success) {
        setPriceAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to load price alerts:', error);
    }
  };

  const filterAndSortData = () => {
    let filtered = [...marketData];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(item => 
        item.cropName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.variety?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(item => item.state === selectedState);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.cropName.localeCompare(b.cropName);
        case 'price_high':
          return b.averagePrice - a.averagePrice;
        case 'price_low':
          return a.averagePrice - b.averagePrice;
        case 'change_high':
          return b.changePercent - a.changePercent;
        case 'change_low':
          return a.changePercent - b.changePercent;
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  };

  const handleVoiceSearch = (transcript) => {
    setSearchQuery(transcript);
  };

  const handleRefresh = () => {
    loadMarketData();
    loadPriceAlerts();
  };

  const categories = [
    { value: 'all', label: t('crops.allCategories') },
    { value: 'cereals', label: t('crops.cereals') },
    { value: 'pulses', label: t('crops.pulses') },
    { value: 'vegetables', label: t('crops.vegetables') },
    { value: 'fruits', label: t('crops.fruits') },
    { value: 'spices', label: t('crops.spices') }
  ];

  const states = [
    { value: 'all', label: t('common.allStates') },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },  
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' }
  ];

  const sortOptions = [
    { value: 'name', label: t('market.sortByName') },
    { value: 'price_high', label: t('market.priceHighToLow') },
    { value: 'price_low', label: t('market.priceLowToHigh') },
    { value: 'change_high', label: t('market.changeHighToLow') },
    { value: 'change_low', label: t('market.changeLowToHigh') }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <PriceLoadingSpinner text={t('market.loadingPrices')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            💰 {t('market.liveMarketPrices')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('market.subtitle')} • {t('market.lastUpdated')}: {dateHelpers.formatRelativeTime(lastUpdated)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Badge variant="success" className="px-3 py-1">
            {t('market.live')} 🔴
          </Badge>
        </div>
      </div>

      {/* Price Alerts */}
      {priceAlerts.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('market.priceAlerts')}:</strong>{' '}
            {priceAlerts[0].message}
            {priceAlerts.length > 1 && (
              <span className="ml-2">
                +{priceAlerts.length - 1} {t('market.moreAlerts')}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t('market.searchAndFilter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <SearchInput
                placeholder={t('market.searchCrops')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <VoiceButton
                  mode="listen"
                  onTranscript={handleVoiceSearch}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('market.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder={t('market.state')} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('market.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('market.moreFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Price Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.cropName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.variety}</p>
                    </div>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {numberHelpers.formatCurrency(item.averagePrice)}
                    </div>
                    <p className="text-xs text-muted-foreground">{t('market.perTon')}</p>
                  </div>

                  <div className="flex items-center justify-center">
                    <TrendBadge trend={item.trend} />
                    <span className={`ml-2 text-sm font-medium ${
                      item.changePercent > 0 ? 'text-green-600' : 
                      item.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.changePercent > 0 ? '+' : ''}
                      {numberHelpers.formatPercentage(item.changePercent)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>{t('market.minimum')}:</span>
                      <span className="font-medium">{numberHelpers.formatCurrency(item.minimumPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('market.maximum')}:</span>
                      <span className="font-medium">{numberHelpers.formatCurrency(item.maximumPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('market.location')}:</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.marketLocation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {dateHelpers.formatRelativeTime(item.lastUpdated)}
                    </span>
                    <Button size="sm" variant="outline">
                      {t('market.viewChart')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('market.noPricesFound')}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t('market.topGainers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketData
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.cropName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">
                        +{numberHelpers.formatPercentage(item.changePercent)}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                {t('market.topLosers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketData
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.cropName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-medium">
                        {numberHelpers.formatPercentage(item.changePercent)}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('market.marketSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t('market.totalCrops')}:</span>
                <span className="font-medium">{marketData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('market.advancing')}:</span>
                <span className="font-medium text-green-600">
                  {marketData.filter(item => item.changePercent > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('market.declining')}:</span>
                <span className="font-medium text-red-600">
                  {marketData.filter(item => item.changePercent < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('market.unchanged')}:</span>
                <span className="font-medium text-gray-600">
                  {marketData.filter(item => item.changePercent === 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Price Chart */}
      {filteredData.length > 0 && (
        <PriceChart
          cropId={filteredData[0].id}
          cropName={filteredData[0].cropName}
          height={400}
          showComparison={true}
        />
      )}
    </div>
  );
};

export default MarketPrices;
