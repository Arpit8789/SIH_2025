// src/pages/dashboard/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package,
  Search,
  MapPin,
  Phone,
  Star,
  Filter,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import PriceChart from '@/components/charts/PriceChart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useDebounce } from '@/hooks/useDebounce';
import { buyerService } from '@/services/buyerService';
import { farmerService } from '@/services/farmerService';
import { marketService } from '@/services/marketService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';

const BuyerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [nearbyFarmers, setNearbyFarmers] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Load dashboard data from backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter crops based on search and filters
  useEffect(() => {
    filterCrops();
  }, [debouncedSearch, selectedCategory, locationFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Get buyer dashboard overview from backend
      const response = await buyerService.getDashboardOverview();
      
      if (response.success) {
        const data = response.data;
        setDashboardData(data.overview);
        setAvailableCrops(data.availableCrops || []);
        setNearbyFarmers(data.nearbyFarmers || []);
        setMarketTrends(data.marketTrends || []);
      }
    } catch (error) {
      console.error('Failed to load buyer dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCrops = async () => {
    try {
      const response = await buyerService.searchCrops({
        query: debouncedSearch,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        location: locationFilter || undefined,
        limit: 20
      });
      
      if (response.success) {
        setAvailableCrops(response.data.crops);
      }
    } catch (error) {
      console.error('Failed to filter crops:', error);
    }
  };

  const handleContactFarmer = (farmerId) => {
    navigate(`/farmers/${farmerId}`);
  };

  const handleViewCropDetails = (cropId) => {
    navigate(`/crops/${cropId}`);
  };

  const handleVoiceSearch = (transcript) => {
    setSearchQuery(transcript);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || t('common.buyer');
    
    if (hour < 12) {
      return t('dashboard.goodMorning', { name });
    } else if (hour < 17) {
      return t('dashboard.goodAfternoon', { name });
    } else {
      return t('dashboard.goodEvening', { name });
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('dashboard.loading')} />
      </div>
    );
  }

  const cropCategories = [
    { value: 'all', label: t('crops.allCategories') },
    { value: 'cereals', label: t('crops.cereals') },
    { value: 'pulses', label: t('crops.pulses') },
    { value: 'vegetables', label: t('crops.vegetables') },
    { value: 'fruits', label: t('crops.fruits') },
    { value: 'spices', label: t('crops.spices') }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🛒 {getGreeting()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.buyerWelcome', { businessType: dashboardData.businessType })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-3 py-1">
            {t('dashboard.online')} ✅
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {t('dashboard.availableCrops')}
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {dashboardData.stats.availableCrops}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.newListings} {t('dashboard.newThisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('dashboard.activeFarmers')}
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {dashboardData.stats.activeFarmers}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.inYourArea')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              {t('dashboard.totalPurchases')}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {numberHelpers.formatCurrency(dashboardData.stats.totalPurchases)}
            </div>
            <p className="text-xs text-green-600">
              +{dashboardData.stats.growthPercent}% {t('dashboard.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {t('dashboard.avgPrice')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {numberHelpers.formatCurrency(dashboardData.stats.averagePrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.perTon')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t('dashboard.findCrops')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchInput
                placeholder={t('dashboard.searchCrops')}
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
                <SelectValue placeholder={t('dashboard.category')} />
              </SelectTrigger>
              <SelectContent>
                {cropCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder={t('dashboard.locationFilter')}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('dashboard.moreFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Available Crops */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('dashboard.availableCrops')} ({availableCrops.length})
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/marketplace')}
                >
                  {t('dashboard.viewAll')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCrops.map((crop, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{crop.name}</h4>
                        <p className="text-sm text-muted-foreground">{crop.variety}</p>
                      </div>
                      <Badge variant="outline">{crop.category}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('dashboard.quantity')}:</span>
                        <span className="font-medium">{numberHelpers.formatNumber(crop.quantity)} tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('dashboard.price')}:</span>
                        <span className="font-medium text-green-600">
                          {numberHelpers.formatCurrency(crop.pricePerTon)}/ton
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('dashboard.location')}:</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {crop.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('dashboard.farmer')}:</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {crop.farmer.name} ({crop.farmer.rating}/5)
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCropDetails(crop.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('dashboard.viewDetails')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContactFarmer(crop.farmer.id)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {t('dashboard.contact')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {availableCrops.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('dashboard.noCropsFound')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('dashboard.marketTrends')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart
                cropId="wheat" // Most traded crop
                cropName="Wheat"
                height={300}
                showComparison={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Nearby Farmers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('dashboard.nearbyFarmers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nearbyFarmers.map((farmer, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 bg-gradient-ag rounded-full flex items-center justify-center text-white font-medium">
                    {farmer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{farmer.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {farmer.location} • {farmer.distance}km
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{farmer.rating}/5</span>
                      <span className="text-xs text-muted-foreground">
                        ({farmer.totalCrops} crops)
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleContactFarmer(farmer.id)}
                  >
                    {t('dashboard.view')}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/marketplace')}
              >
                <Search className="mr-2 h-4 w-4" />
                {t('dashboard.browseCrops')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/farmers')}
              >
                <Users className="mr-2 h-4 w-4" />
                {t('dashboard.findFarmers')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/market-analysis')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('dashboard.marketAnalysis')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/orders')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t('dashboard.myOrders')}
              </Button>
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
              {marketTrends.map((trend, index) => (
                <div key={index} className="border-l-4 border-l-primary pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{trend.cropName}</h4>
                    <Badge 
                      variant={trend.recommendation === 'buy' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {trend.recommendation}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{trend.insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
