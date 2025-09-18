// src/pages/features/CropRecommendations.jsx
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
  Lightbulb
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aiService } from '@/services/aiService';
import { cropService } from '@/services/cropService';
import { weatherService } from '@/services/weatherService';
import { soilService } from '@/services/soilService';
import { numberHelpers, dateHelpers } from '@/utils/helpers';

const CropRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [seasonalCrops, setSeasonalCrops] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [selectedLandSize, setSelectedLandSize] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisFactors, setAnalysisFactors] = useState({});

  const { t } = useLanguage();
  const { user } = useAuth();
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    loadRecommendationData();
  }, [selectedSeason, selectedLandSize]);

  const loadRecommendationData = async () => {
    setIsLoading(true);
    
    try {
      // Get user location and profile
      const location = await getCurrentPosition().catch(() => null);
      
      // Load user farming profile
      if (user?.role === 'farmer') {
        const profileResponse = await aiService.getFarmerProfile({
          farmerId: user.id
        });
        if (profileResponse.success) {
          setUserProfile(profileResponse.data.profile);
        }
      }

      // Get AI-powered crop recommendations
      const recommendationsResponse = await aiService.getCropRecommendations({
        farmerId: user?.id,
        location: location,
        season: selectedSeason,
        landSize: selectedLandSize !== 'all' ? selectedLandSize : undefined,
        includeAnalysis: true
      });
      
      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.data.recommendations || []);
        setAnalysisFactors(recommendationsResponse.data.analysisFactors || {});
      }

      // Load seasonal crop data
      const seasonalResponse = await cropService.getSeasonalCrops({
        location: location,
        season: selectedSeason
      });
      
      if (seasonalResponse.success) {
        setSeasonalCrops(seasonalResponse.data.crops || []);
      }

      // Load market trends for recommended crops
      const trendsResponse = await aiService.getCropMarketTrends({
        location: location,
        timeframe: '3months'
      });
      
      if (trendsResponse.success) {
        setMarketTrends(trendsResponse.data.trends || []);
      }

    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceQuery = (transcript) => {
    console.log('Voice crop query:', transcript);
  };

  const getSuitabilityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSuitabilityLabel = (score) => {
    if (score >= 80) return t('crops.highSuitability');
    if (score >= 60) return t('crops.moderateSuitability');
    return t('crops.lowSuitability');
  };

  const getProfitabilityIcon = (level) => {
    if (level === 'high') return '💰';
    if (level === 'medium') return '💸';
    return '💴';
  };

  const getRiskIcon = (level) => {
    if (level === 'low') return '🟢';
    if (level === 'medium') return '🟡';
    return '🔴';
  };

  const seasons = [
    { value: 'current', label: t('crops.currentSeason') },
    { value: 'kharif', label: t('crops.kharif') },
    { value: 'rabi', label: t('crops.rabi') },
    { value: 'zaid', label: t('crops.zaid') }
  ];

  const landSizes = [
    { value: 'all', label: t('crops.allSizes') },
    { value: 'small', label: t('crops.smallFarm') + ' (< 2 acres)' },
    { value: 'medium', label: t('crops.mediumFarm') + ' (2-10 acres)' },
    { value: 'large', label: t('crops.largeFarm') + ' (> 10 acres)' }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('crops.loadingRecommendations')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🌾 {t('crops.aiRecommendations')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('crops.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceQuery}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="success" className="px-3 py-1">
            {t('crops.aiPowered')} 🤖
          </Badge>
        </div>
      </div>

      {/* Analysis Summary */}
      {Object.keys(analysisFactors).length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('crops.analysisFactors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-muted-foreground">{t('weather.climate')}</p>
                <p className="font-bold">{analysisFactors.climateScore || 0}/100</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Leaf className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">{t('soil.quality')}</p>
                <p className="font-bold">{analysisFactors.soilScore || 0}/100</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">{t('water.availability')}</p>
                <p className="font-bold">{analysisFactors.waterScore || 0}/100</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">{t('market.potential')}</p>
                <p className="font-bold">{analysisFactors.marketScore || 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t('crops.customizeRecommendations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('crops.season')}</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('crops.farmSize')}</label>
              <Select value={selectedLandSize} onValueChange={setSelectedLandSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {landSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">{t('crops.aiRecommended')}</TabsTrigger>
          <TabsTrigger value="seasonal">{t('crops.seasonalCrops')}</TabsTrigger>
          <TabsTrigger value="trends">{t('crops.marketTrends')}</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((crop, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{crop.emoji || '🌱'}</div>
                      <div>
                        <CardTitle className="text-xl">{crop.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{crop.scientificName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{crop.suitabilityScore}/100</div>
                      <Badge variant={crop.suitabilityScore >= 80 ? 'success' : crop.suitabilityScore >= 60 ? 'warning' : 'destructive'}>
                        {getSuitabilityLabel(crop.suitabilityScore)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Suitability Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('crops.overallSuitability')}</span>
                      <span>{crop.suitabilityScore}%</span>
                    </div>
                    <Progress value={crop.suitabilityScore} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-lg">{getProfitabilityIcon(crop.profitability)}</div>
                      <p className="text-xs text-muted-foreground">{t('crops.profitability')}</p>
                      <p className="font-semibold text-sm capitalize">{crop.profitability}</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-lg">⏱️</div>
                      <p className="text-xs text-muted-foreground">{t('crops.growthPeriod')}</p>
                      <p className="font-semibold text-sm">{crop.growthPeriod} days</p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="text-lg">{getRiskIcon(crop.riskLevel)}</div>
                      <p className="text-xs text-muted-foreground">{t('crops.riskLevel')}</p>
                      <p className="font-semibold text-sm capitalize">{crop.riskLevel}</p>
                    </div>
                  </div>

                  {/* Financial Projections */}
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      {t('crops.financialProjection')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t('crops.expectedYield')}</p>
                        <p className="font-bold text-primary">{crop.expectedYield} tons/acre</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('crops.estimatedRevenue')}</p>
                        <p className="font-bold text-green-600">{numberHelpers.formatCurrency(crop.estimatedRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('crops.investmentCost')}</p>
                        <p className="font-bold text-red-600">{numberHelpers.formatCurrency(crop.investmentCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('crops.netProfit')}</p>
                        <p className="font-bold text-purple-600">{numberHelpers.formatCurrency(crop.netProfit)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Requirements */}
                  <div>
                    <h4 className="font-semibold mb-2">{t('crops.keyRequirements')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{t('crops.waterNeed')}:</span>
                          <span className="font-medium">{crop.requirements?.water || 'Medium'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('crops.soilType')}:</span>
                          <span className="font-medium">{crop.requirements?.soilType || 'Loamy'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{t('crops.temperature')}:</span>
                          <span className="font-medium">{crop.requirements?.temperature || '20-30°C'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('crops.rainfall')}:</span>
                          <span className="font-medium">{crop.requirements?.rainfall || '500mm'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1">
                      🤖 {t('crops.aiReasoning')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      {crop.aiReasoning || t('crops.defaultReasoning')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('crops.selectCrop')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {t('crops.getAdvice')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {t('crops.viewAnalysis')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonalCrops.map((crop, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{crop.emoji}</div>
                    <div>
                      <h3 className="font-semibold">{crop.name}</h3>
                      <p className="text-sm text-muted-foreground">{crop.category}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('crops.plantingTime')}:</span>
                      <span className="font-medium">{crop.plantingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('crops.harvestTime')}:</span>
                      <span className="font-medium">{crop.harvestTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('crops.marketPrice')}:</span>
                      <span className="font-medium text-green-600">{numberHelpers.formatCurrency(crop.currentPrice)}/ton</span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full mt-3">
                    {t('crops.getRecommendation')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            {marketTrends.map((trend, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{trend.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{trend.cropName}</h3>
                        <p className="text-sm text-muted-foreground">{trend.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={trend.trend === 'rising' ? 'success' : trend.trend === 'falling' ? 'destructive' : 'secondary'}>
                        {trend.trend === 'rising' ? '📈' : trend.trend === 'falling' ? '📉' : '➖'} {trend.changePercent}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('market.currentPrice')}</p>
                      <p className="font-bold text-lg">{numberHelpers.formatCurrency(trend.currentPrice)}/ton</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('market.predictedPrice')}</p>
                      <p className="font-bold text-lg text-blue-600">{numberHelpers.formatCurrency(trend.predictedPrice)}/ton</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('market.demand')}</p>
                      <p className="font-bold">{trend.demandLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('market.seasonality')}</p>
                      <p className="font-bold">{trend.seasonality}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm leading-relaxed">{trend.analysis}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CropRecommendations;
