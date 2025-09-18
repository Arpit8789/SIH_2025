// src/components/weather/AIWeatherAdvisory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { weatherService } from '@/services/weatherService';

const AIWeatherAdvisory = ({ 
  className,
  showVoiceControls = true,
  compact = false 
}) => {
  const [advisory, setAdvisory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [feedback, setFeedback] = useState({ given: false, helpful: null });

  const { currentLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { speak, cancel, speaking, supported } = useSpeechSynthesis();

  useEffect(() => {
    if (user?.role === 'farmer') {
      loadWeatherAdvisory();
      
      // Auto-refresh every 30 minutes
      const interval = setInterval(loadWeatherAdvisory, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadWeatherAdvisory = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await weatherService.getCurrentWeather();
      
      if (response.success && response.data.agriculturalInfo) {
        const aiAdvice = response.data.agriculturalInfo.find(info => info.source === 'ai');
        
        if (aiAdvice) {
          setAdvisory({
            primaryAdvice: aiAdvice.message,
            additionalTips: aiAdvice.additionalTips || [],
            source: aiAdvice.source,
            timestamp: new Date().toISOString(),
            weather: {
              temperature: response.data.current.temperature,
              condition: response.data.current.condition.description,
              location: response.data.location.name
            },
            regionalCrops: response.data.regionalCrops || []
          });
        } else {
          // Fallback to system advice
          setAdvisory({
            primaryAdvice: response.data.agriculturalInfo[0]?.message || 'No specific advice available',
            additionalTips: [],
            source: 'system',
            timestamp: new Date().toISOString(),
            weather: {
              temperature: response.data.current.temperature,
              condition: response.data.current.condition.description,
              location: response.data.location.name
            },
            regionalCrops: response.data.regionalCrops || []
          });
        }
        
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load weather advisory:', error);
      setError(error.message || 'Failed to load advisory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (speaking) {
      cancel();
      return;
    }

    if (!advisory) return;

    const textToSpeak = currentLanguage === 'hi' 
      ? `मौसम सलाह: ${advisory.primaryAdvice}. ${advisory.additionalTips.join('. ')}`
      : `Weather Advisory: ${advisory.primaryAdvice}. ${advisory.additionalTips.join('. ')}`;

    speak({ 
      text: textToSpeak,
      voice: currentLanguage === 'hi' ? 
        speechSynthesis.getVoices().find(voice => voice.lang.includes('hi')) : 
        null,
      rate: 0.9,
      pitch: 1
    });
  };

  const handleFeedback = async (isHelpful) => {
    try {
      await weatherService.submitAdvisoryFeedback({
        isHelpful,
        timestamp: advisory.timestamp
      });
      
      setFeedback({ given: true, helpful: isHelpful });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'ai':
        return <Brain className="h-4 w-4 text-purple-600" />;
      case 'expert':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSourceBadge = (source) => {
    const badges = {
      ai: { label: 'AI Generated', variant: 'default', color: 'bg-purple-100 text-purple-800' },
      expert: { label: 'Expert Advice', variant: 'success', color: 'bg-yellow-100 text-yellow-800' },
      system: { label: 'System Advisory', variant: 'secondary', color: 'bg-blue-100 text-blue-800' }
    };

    const badge = badges[source] || badges.system;
    
    return (
      <Badge className={`${badge.color} border-0 text-xs font-medium`}>
        <Sparkles className="h-3 w-3 mr-1" />
        {currentLanguage === 'hi' ? 
          (source === 'ai' ? 'AI सलाह' : source === 'expert' ? 'विशेषज्ञ सलाह' : 'सिस्टम सलाह') :
          badge.label
        }
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
            <p className="text-sm text-muted-foreground ml-2">
              {currentLanguage === 'hi' ? 'AI सलाह लोड हो रही है...' : 'Loading AI advisory...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadWeatherAdvisory}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {currentLanguage === 'hi' ? 'पुनः प्रयास' : 'Retry'}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!advisory) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {currentLanguage === 'hi' ? 'कोई सलाह उपलब्ध नहीं' : 'No advisory available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getSourceIcon(advisory.source)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-400 leading-relaxed">
              {advisory.primaryAdvice}
            </p>
            <div className="flex items-center justify-between mt-2">
              {getSourceBadge(advisory.source)}
              {showVoiceControls && supported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeak}
                  className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  {speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            {currentLanguage === 'hi' ? '🤖 AI कृषि सलाह' : '🤖 AI Farming Advisory'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <div className="flex items-center text-green-100 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(lastRefresh).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadWeatherAdvisory}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Weather Context */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">🌡️ {advisory.weather.temperature}°C</span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="capitalize">{advisory.weather.condition}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            📍 {advisory.weather.location}
          </div>
        </div>

        {/* Primary Advisory */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getSourceIcon(advisory.source)}
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                {advisory.primaryAdvice}
              </p>
            </div>
          </div>

          {/* Additional Tips */}
          {advisory.additionalTips && advisory.additionalTips.length > 0 && (
            <div className="ml-7 space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentLanguage === 'hi' ? 'अतिरिक्त सुझाव:' : 'Additional tips:'}
              </h4>
              <ul className="space-y-1">
                {advisory.additionalTips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Regional Crops */}
        {advisory.regionalCrops && advisory.regionalCrops.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
              🌾 {currentLanguage === 'hi' ? 'आपके क्षेत्र की मुख्य फसलें:' : 'Main crops in your region:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {advisory.regionalCrops.slice(0, 4).map((crop, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="text-xs bg-white/50 border-yellow-300 text-yellow-800"
                >
                  {crop.localName || crop.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            {getSourceBadge(advisory.source)}
            
            <div className="text-xs text-muted-foreground">
              {new Date(advisory.timestamp).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Control */}
            {showVoiceControls && supported && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSpeak}
                className="flex items-center gap-2"
              >
                {speaking ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    {currentLanguage === 'hi' ? 'रोकें' : 'Stop'}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    {currentLanguage === 'hi' ? 'सुनें' : 'Listen'}
                  </>
                )}
              </Button>
            )}

            {/* Feedback */}
            {!feedback.given && advisory.source === 'ai' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-2">
                  {currentLanguage === 'hi' ? 'उपयोगी?' : 'Helpful?'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}

            {feedback.given && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {currentLanguage === 'hi' ? 'धन्यवाद!' : 'Thanks!'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIWeatherAdvisory;
