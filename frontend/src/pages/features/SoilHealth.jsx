// src/pages/features/SoilHealth.jsx
import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Camera, 
  Upload, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Droplets,
  Leaf,
  Mountain,
  Activity,
  MapPin,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from '@/components/common/ImageUploader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aiService } from '@/services/aiService';
import { soilService } from '@/services/soilService';
import { cropService } from '@/services/cropService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';

const SoilHealth = () => {
  const [soilTestResults, setSoilTestResults] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentTests, setRecentTests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLabs, setNearbyLabs] = useState([]);

  const { t } = useLanguage();
  const { user } = useAuth();
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user location
      const location = await getCurrentPosition().catch(() => null);
      if (location) {
        setUserLocation(location);
        loadNearbyLabs(location);
      }

      // Load recent soil tests
      const testsResponse = await soilService.getRecentTests({
        farmerId: user?.id,
        limit: 5
      });
      if (testsResponse.success) {
        setRecentTests(testsResponse.data.tests || []);
      }

      // Load soil health recommendations
      const recsResponse = await soilService.getSoilRecommendations({
        farmerId: user?.id,
        location: location
      });
      if (recsResponse.success) {
        setRecommendations(recsResponse.data.recommendations || []);
      }

    } catch (error) {
      console.error('Failed to load soil data:', error);
    }
  };

  const loadNearbyLabs = async (location) => {
    try {
      const response = await soilService.getNearbyLabs({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 50 // 50km radius
      });
      if (response.success) {
        setNearbyLabs(response.data.labs || []);
      }
    } catch (error) {
      console.error('Failed to load nearby labs:', error);
    }
  };

  const handleImageUpload = (images) => {
    setUploadedImages(images);
  };

  const analyzeSoilImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);
    
    try {
      // Call AI soil analysis API
      const response = await aiService.analyzeSoilImages({
        images: uploadedImages.map(img => img.url),
        location: userLocation,
        farmerId: user?.id
      });

      if (response.success) {
        setSoilTestResults(response.data.analysis);
      }
    } catch (error) {
      console.error('Soil analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceQuery = (transcript) => {
    console.log('Voice soil query:', transcript);
  };

  const getHealthScore = (score) => {
    if (score >= 80) return { label: t('soil.excellent'), color: 'success', icon: '🟢' };
    if (score >= 60) return { label: t('soil.good'), color: 'success', icon: '🟡' };
    if (score >= 40) return { label: t('soil.moderate'), color: 'warning', icon: '🟠' };
    return { label: t('soil.poor'), color: 'destructive', icon: '🔴' };
  };

  const getNutrientStatus = (level) => {
    if (level === 'high') return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' };
    if (level === 'medium') return { icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🌱 {t('soil.healthAnalysis')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('soil.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceQuery}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="outline" className="px-3 py-1">
            {t('soil.aiPowered')} 🤖
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {t('soil.imageAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUpload={handleImageUpload}
                maxFiles={3}
                maxSizeInMB={10}
                placeholder={t('soil.uploadSoilImages')}
                preview={true}
              />
              
              {uploadedImages.length > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={analyzeSoilImages}
                    disabled={isAnalyzing}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Beaker className="mr-2 h-5 w-5 animate-pulse" />
                        {t('soil.analyzing')}
                      </>
                    ) : (
                      <>
                        <Beaker className="mr-2 h-5 w-5" />
                        {t('soil.analyzeImages')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {soilTestResults && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t('soil.analysisResults')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Health Score */}
                <div className="bg-primary/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{t('soil.overallHealth')}</h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary flex items-center gap-2">
                        {getHealthScore(soilTestResults.overallScore).icon}
                        {soilTestResults.overallScore}/100
                      </div>
                      <Badge variant={getHealthScore(soilTestResults.overallScore).color}>
                        {getHealthScore(soilTestResults.overallScore).label}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={soilTestResults.overallScore} className="h-3" />
                </div>

                {/* Nutrient Analysis */}
                <div>
                  <h4 className="font-semibold mb-4">{t('soil.nutrientAnalysis')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {soilTestResults.nutrients.map((nutrient, index) => {
                      const status = getNutrientStatus(nutrient.level);
                      return (
                        <div key={index} className={`p-4 rounded-lg border ${status.bg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{nutrient.name}</span>
                            <status.icon className={`h-4 w-4 ${status.color}`} />
                          </div>
                          <div className="text-2xl font-bold mb-1">{nutrient.value}</div>
                          <div className="text-xs text-muted-foreground">{nutrient.unit}</div>
                          <Badge 
                            variant={nutrient.level === 'high' ? 'success' : nutrient.level === 'medium' ? 'warning' : 'destructive'}
                            className="mt-2"
                          >
                            {t(`soil.${nutrient.level}`)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Soil Properties */}
                <div>
                  <h4 className="font-semibold mb-4">{t('soil.soilProperties')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{t('soil.moistureContent')}</span>
                        </div>
                        <span className="font-bold">{soilTestResults.properties.moisture}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{t('soil.phLevel')}</span>
                        </div>
                        <span className="font-bold">{soilTestResults.properties.ph}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{t('soil.soilTexture')}</span>
                        </div>
                        <span className="font-bold">{soilTestResults.properties.texture}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{t('soil.organicMatter')}</span>
                        </div>
                        <span className="font-bold">{soilTestResults.properties.organicMatter}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                    💡 {t('soil.recommendations')}
                  </h4>
                  <div className="space-y-3">
                    {soilTestResults.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{rec.title}</h5>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            {rec.priority && (
                              <Badge variant={rec.priority === 'high' ? 'destructive' : 'warning'} className="mt-2 text-xs">
                                {t(`soil.${rec.priority}Priority`)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Tests History */}
          {recentTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t('soil.recentTests')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Beaker className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{test.testType}</p>
                          <p className="text-sm text-muted-foreground">
                            {dateHelpers.formatDate(test.testDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{test.overallScore}/100</div>
                        <Badge variant={getHealthScore(test.overallScore).color} className="text-xs">
                          {getHealthScore(test.overallScore).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('soil.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                {t('soil.uploadReport')}
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                {t('soil.findLabs')}
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                {t('soil.downloadReport')}
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('soil.scheduleTest')}
              </Button>
            </CardContent>
          </Card>

          {/* Nearby Labs */}
          {nearbyLabs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t('soil.nearbyLabs')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearbyLabs.slice(0, 3).map((lab, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">{lab.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{lab.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">{lab.distance} km</span>
                      <Badge variant="outline" className="text-xs">
                        ₹{lab.priceRange}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Soil Health Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="h-4 w-4 text-primary" />
                {t('soil.healthTips')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('soil.tip1')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('soil.tip2')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('soil.tip3')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t('soil.seasonalAdvice')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-3 bg-accent/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilHealth;
