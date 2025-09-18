// src/pages/features/DiseaseDetection.jsx
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Bug,
  Leaf,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from '@/components/common/ImageUploader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { aiService } from '@/services/aiService';
import { cropService } from '@/services/cropService';
import { weatherService } from '@/services/weatherService';
import { dateHelpers } from '@/utils/helpers';

const DiseaseDetection = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [commonDiseases, setCommonDiseases] = useState([]);
  const [weatherFactors, setWeatherFactors] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const { t } = useLanguage();
  const { user } = useAuth();
  const { getCurrentPosition } = useGeolocation();

  useEffect(() => {
    loadRecentAnalyses();
    loadCommonDiseases();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadWeatherFactors();
    }
  }, [userLocation]);

  const getUserLocation = async () => {
    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
    } catch (error) {
      console.log('Location access denied, using default location');
    }
  };

  const loadWeatherFactors = async () => {
    try {
      const response = await weatherService.getWeatherForDiseaseAnalysis({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      
      if (response.success) {
        setWeatherFactors(response.data.weatherFactors);
      }
    } catch (error) {
      console.error('Failed to load weather factors:', error);
    }
  };

  const loadRecentAnalyses = async () => {
    try {
      const response = await aiService.getRecentDiseaseAnalyses({
        userId: user?.id,
        limit: 5
      });
      
      if (response.success) {
        setRecentAnalyses(response.data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load recent analyses:', error);
    }
  };

  const loadCommonDiseases = async () => {
    try {
      const response = await cropService.getCommonDiseases({
        location: userLocation,
        season: getCurrentSeason()
      });
      
      if (response.success) {
        setCommonDiseases(response.data.diseases || []);
      }
    } catch (error) {
      console.error('Failed to load common diseases:', error);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 6) return 'summer';
    if (month >= 7 && month <= 10) return 'monsoon';
    return 'winter';
  };

  const handleImageUpload = (images) => {
    setUploadedImages(images);
    setAnalysisResult(null);
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // Call AI disease detection API
      const response = await aiService.detectCropDisease({
        images: uploadedImages.map(img => img.url),
        metadata: {
          location: userLocation,
          timestamp: new Date().toISOString(),
          weatherConditions: weatherFactors,
          farmerId: user?.id
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.success) {
        setAnalysisResult(response.data.analysis);
        
        // Reload recent analyses
        setTimeout(() => {
          loadRecentAnalyses();
        }, 1000);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Disease analysis failed:', error);
      setAnalysisResult({
        error: true,
        message: error.message || t('disease.analysisFailed')
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 2000);
    }
  };

  const handleVoiceQuery = (transcript) => {
    const query = transcript.toLowerCase();
    // Process voice queries about diseases
    console.log('Voice query about disease:', query);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
      case 'mild':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🔬 {t('disease.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('disease.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceQuery}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="success" className="px-3 py-1">
            {t('disease.aiPowered')} 🤖
          </Badge>
        </div>
      </div>

      {/* Weather Alert */}
      {weatherFactors && weatherFactors.diseaseRisk === 'high' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('disease.highRiskAlert')}:</strong>{' '}
            {t('disease.weatherRiskMessage', { 
              humidity: weatherFactors.humidity,
              temperature: weatherFactors.temperature 
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {t('disease.uploadImages')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUpload={handleImageUpload}
                maxFiles={3}
                maxSizeInMB={10}
                placeholder={t('disease.uploadPlaceholder')}
                preview={true}
              />
              
              {uploadedImages.length > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={analyzeImages}
                    disabled={isAnalyzing}
                    className="px-8"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Scan className="mr-2 h-5 w-5 animate-spin" />
                        {t('disease.analyzing')}
                      </>
                    ) : (
                      <>
                        <Scan className="mr-2 h-5 w-5" />
                        {t('disease.startAnalysis')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <Scan className="h-12 w-12 mx-auto text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t('disease.analyzingImages')}</p>
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(analysisProgress)}% {t('common.complete')}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysisProgress < 30 && t('disease.processingImages')}
                    {analysisProgress >= 30 && analysisProgress < 60 && t('disease.detectingPatterns')}
                    {analysisProgress >= 60 && analysisProgress < 90 && t('disease.identifyingDisease')}
                    {analysisProgress >= 90 && t('disease.generatingReport')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && !analysisResult.error && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t('disease.analysisResults')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Detection */}
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">
                        {analysisResult.primaryDetection.diseaseName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.primaryDetection.scientificName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getConfidenceColor(analysisResult.primaryDetection.confidence)}`}>
                        {analysisResult.primaryDetection.confidence}%
                      </div>
                      <p className="text-xs text-muted-foreground">{t('disease.confidence')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className={`p-3 rounded-lg border ${getSeverityColor(analysisResult.primaryDetection.severity)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('disease.severity')}</span>
                      </div>
                      <div className="font-semibold capitalize">{analysisResult.primaryDetection.severity}</div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">{t('disease.cropType')}</span>
                      </div>
                      <div className="font-semibold text-blue-700">{analysisResult.cropType}</div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Bug className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">{t('disease.affectedArea')}</span>
                      </div>
                      <div className="font-semibold text-purple-700">{analysisResult.primaryDetection.affectedArea}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">{t('disease.symptoms')}</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.primaryDetection.symptoms.map((symptom, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t('disease.causes')}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysisResult.primaryDetection.causes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Treatment Recommendations */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {t('disease.treatmentRecommendations')}
                  </h4>
                  
                  <Tabs defaultValue="immediate" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="immediate">{t('disease.immediate')}</TabsTrigger>
                      <TabsTrigger value="preventive">{t('disease.preventive')}</TabsTrigger>
                      <TabsTrigger value="organic">{t('disease.organic')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="immediate" className="space-y-3">
                      {analysisResult.recommendations.immediate.map((rec, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium mb-1">{rec.title}</h5>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              {rec.dosage && (
                                <p className="text-xs text-blue-600 mt-1">
                                  <strong>{t('disease.dosage')}:</strong> {rec.dosage}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="preventive" className="space-y-3">
                      {analysisResult.recommendations.preventive.map((rec, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium mb-1">{rec.title}</h5>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="organic" className="space-y-3">
                      {analysisResult.recommendations.organic.map((rec, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-600 text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium mb-1">{rec.title}</h5>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <p className="text-xs text-green-600 mt-1">
                                <strong>{t('disease.preparation')}:</strong> {rec.preparation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Alternative Detections */}
                {analysisResult.alternativeDetections && analysisResult.alternativeDetections.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">{t('disease.otherPossibilities')}</h4>
                    <div className="space-y-2">
                      {analysisResult.alternativeDetections.map((detection, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <span className="font-medium">{detection.diseaseName}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({detection.confidence}% {t('disease.confidence')})
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            {t('disease.viewDetails')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Results */}
          {analysisResult && analysisResult.error && (
            <Card className="border-red-200">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  {t('disease.analysisError')}
                </h3>
                <p className="text-muted-foreground mb-4">{analysisResult.message}</p>
                <Button onClick={() => setAnalysisResult(null)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('common.tryAgain')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Common Diseases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bug className="h-4 w-4 text-primary" />
                {t('disease.commonDiseases')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commonDiseases.map((disease, index) => (
                <div key={index} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{disease.name}</h4>
                    <Badge variant="outline" className="text-xs">{disease.prevalence}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{disease.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{t('disease.affects')}:</span>
                    <span className="font-medium">{disease.cropTypes.join(', ')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t('disease.recentAnalyses')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAnalyses.map((analysis, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">{analysis.diseaseName}</span>
                      <Badge 
                        variant={analysis.confidence >= 80 ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {analysis.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dateHelpers.formatRelativeTime(analysis.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Weather Factors */}
          {weatherFactors && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Thermometer className="h-4 w-4 text-primary" />
                  {t('disease.weatherFactors')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-muted-foreground">{t('weather.humidity')}</p>
                    <p className="font-medium text-sm">{weatherFactors.humidity}%</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                    <Thermometer className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                    <p className="text-xs text-muted-foreground">{t('weather.temperature')}</p>
                    <p className="font-medium text-sm">{weatherFactors.temperature}°C</p>
                  </div>
                </div>
                
                <Alert variant={weatherFactors.diseaseRisk === 'high' ? 'destructive' : 'default'}>
                  <AlertDescription className="text-xs">
                    {t('disease.riskLevel')}: <strong>{weatherFactors.diseaseRisk}</strong>
                    <br />
                    {weatherFactors.riskFactors}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-primary" />
                {t('disease.photographyTips')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('disease.tip1')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('disease.tip2')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>{t('disease.tip3')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
