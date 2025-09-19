// src/components/market/RecommendationCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Clock, Target } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { RECOMMENDATION_TYPES } from '@/utils/marketConstants';
import { cn } from '@/lib/utils';

const RecommendationCard = ({ 
  recommendation, 
  confidence, 
  reasoning, 
  nextAction,
  onActionClick 
}) => {
  const { currentLanguage } = useLanguage();

  if (!recommendation || !confidence) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <AlertTriangle className="h-5 w-5" />
            {currentLanguage === 'hi' ? 'सुझाव उपलब्ध नहीं' : 'No Recommendation Available'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {currentLanguage === 'hi' 
              ? 'पर्याप्त डेटा नहीं मिला है' 
              : 'Insufficient data for recommendation'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const recType = RECOMMENDATION_TYPES[recommendation];
  const getConfidenceLevel = () => {
    if (confidence >= 80) return { level: 'high', text: 'उच्च', color: 'text-green-600' };
    if (confidence >= 60) return { level: 'medium', text: 'मध्यम', color: 'text-yellow-600' };
    return { level: 'low', text: 'कम', color: 'text-red-600' };
  };

  const confidenceLevel = getConfidenceLevel();

  const getActionIcon = () => {
    switch (recommendation) {
      case 'SELL':
        return <TrendingUp className="h-5 w-5" />;
      case 'HOLD':
        return <Clock className="h-5 w-5" />;
      case 'WAIT':
        return <Target className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    const actions = {
      'SELL': {
        hi: 'अभी बेचें',
        en: 'SELL NOW'
      },
      'HOLD': {
        hi: 'थोड़ा रुकें',
        en: 'HOLD'
      },
      'WAIT': {
        hi: 'इंतजार करें',
        en: 'WAIT'
      }
    };
    
    return actions[recommendation]?.[currentLanguage === 'hi' ? 'hi' : 'en'] || 'WAIT';
  };

  return (
    <Card className={cn(
      `${recType?.bgColor} ${recType?.borderColor} border-2 shadow-lg`,
      "hover:shadow-xl transition-all duration-200"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/50">
            {getActionIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={recType?.textColor}>
                {currentLanguage === 'hi' ? 'AI सुझाव' : 'AI Recommendation'}
              </span>
              <Badge variant="outline" className="text-xs">
                {currentLanguage === 'hi' ? 'बुद्धिमान' : 'Smart'}
              </Badge>
            </div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              {currentLanguage === 'hi' 
                ? `${confidenceLevel.text} विश्वसनीयता: ${confidence}%`
                : `${confidenceLevel.level} confidence: ${confidence}%`
              }
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Recommendation */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            <span className="text-2xl">{recType?.icon}</span>
            <span className={`ml-2 ${recType?.textColor}`}>
              {getActionText()}
            </span>
          </div>
          
          {/* Confidence Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                confidence >= 80 ? "bg-green-500" : 
                confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-600">
            {currentLanguage === 'hi' 
              ? `${confidence}% आत्मविश्वास के साथ सुझाव`
              : `${confidence}% confidence recommendation`
            }
          </p>
        </div>

        {/* Reasoning */}
        {reasoning && (
          <div className="bg-white/70 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2 text-gray-700">
              {currentLanguage === 'hi' ? '🤔 कारण:' : '🤔 Reason:'}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {typeof reasoning === 'object' 
                ? reasoning[currentLanguage === 'hi' ? 'hi' : 'en'] 
                : reasoning
              }
            </p>
          </div>
        )}

        {/* Next Action */}
        {nextAction && (
          <div className="bg-white/70 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2 text-gray-700">
              {currentLanguage === 'hi' ? '⏭️ अगला कदम:' : '⏭️ Next Step:'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {typeof nextAction === 'object' 
                ? nextAction[currentLanguage === 'hi' ? 'hi' : 'en'] 
                : nextAction
              }
            </p>
            
            {onActionClick && (
              <Button 
                size="sm" 
                onClick={onActionClick}
                className={cn(
                  "w-full",
                  recommendation === 'SELL' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {recommendation === 'SELL' 
                  ? (currentLanguage === 'hi' ? '🏪 बेचने के विकल्प देखें' : '🏪 View Selling Options')
                  : (currentLanguage === 'hi' ? '📊 मॉनिटर करें' : '📊 Monitor Prices')
                }
              </Button>
            )}
          </div>
        )}

        {/* Warning for low confidence */}
        {confidence < 60 && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {currentLanguage === 'hi' 
                ? 'कम विश्वसनीयता - अतिरिक्त जानकारी की जांच करें'
                : 'Low confidence - verify with additional information'
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
