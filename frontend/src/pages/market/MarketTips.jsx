// src/components/market/MarketTips.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const MarketTips = ({ cropId, seasonalAdvice, marketInsights, className }) => {
  const { currentLanguage } = useLanguage();

  // Generate general market tips
  const getGeneralTips = () => {
    return [
      {
        type: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
        title: currentLanguage === 'hi' ? 'दैनिक मॉनिटरिंग' : 'Daily Monitoring',
        message: currentLanguage === 'hi' 
          ? 'रोजाना बाजार की दरों पर नज़र रखें और trends को समझें।'
          : 'Monitor market prices daily and understand trends.',
        priority: 'high'
      },
      {
        type: 'info',
        icon: <Info className="h-4 w-4" />,
        title: currentLanguage === 'hi' ? 'मौसम का प्रभाव' : 'Weather Impact',
        message: currentLanguage === 'hi'
          ? 'मौसम की जानकारी रखें क्योंकि यह फसल की कीमतों को प्रभावित करता है।'
          : 'Stay updated on weather as it affects crop prices.',
        priority: 'medium'
      },
      {
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: currentLanguage === 'hi' ? 'भंडारण लागत' : 'Storage Costs',
        message: currentLanguage === 'hi'
          ? 'लंबे समय तक रखने की लागत और नुकसान का हिसाब रखें।'
          : 'Consider storage costs and losses for holding longer.',
        priority: 'high'
      },
      {
        type: 'info',
        icon: <Info className="h-4 w-4" />,
        title: currentLanguage === 'hi' ? 'कई बाजार की तुलना' : 'Compare Markets',
        message: currentLanguage === 'hi'
          ? 'अलग-अलग mandis की दरों की तुलना करके बेहतर दाम पाएं।'
          : 'Compare prices across different mandis for better rates.',
        priority: 'medium'
      }
    ];
  };

  // Get crop specific tips
  const getCropSpecificTips = () => {
    const cropTips = {
      wheat: [
        {
          type: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          title: currentLanguage === 'hi' ? 'गेहूं की गुणवत्ता' : 'Wheat Quality',
          message: currentLanguage === 'hi'
            ? 'अच्छी quality और सही moisture content बेहतर दाम दिलाती है।'
            : 'Good quality and proper moisture content fetch better prices.'
        }
      ],
      rice: [
        {
          type: 'info',
          icon: <Info className="h-4 w-4" />,
          title: currentLanguage === 'hi' ? 'धान की किस्म' : 'Rice Variety',
          message: currentLanguage === 'hi'
            ? 'Basmati और premium varieties की अलग दरें होती हैं।'
            : 'Basmati and premium varieties have different pricing.'
        }
      ],
      potato: [
        {
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: currentLanguage === 'hi' ? 'आलू का भंडारण' : 'Potato Storage',
          message: currentLanguage === 'hi'
            ? 'Cold storage की लागत vs मार्केट timing का सही balance बनाएं।'
            : 'Balance cold storage costs vs market timing properly.'
        }
      ],
      onion: [
        {
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: currentLanguage === 'hi' ? 'प्याज की अस्थिरता' : 'Onion Volatility',
          message: currentLanguage === 'hi'
            ? 'प्याज की कीमतें बहुत उतार-चढ़ाव वाली होती हैं, सावधानी बरतें।'
            : 'Onion prices are highly volatile, trade carefully.'
        }
      ]
    };

    return cropTips[cropId] || [];
  };

  const getTipStyle = (type) => {
    const styles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600'
      },
      warning: {
        bg: 'bg-orange-50',
        border: 'border-orange-200', 
        text: 'text-orange-700',
        icon: 'text-orange-600'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600'
      }
    };
    return styles[type] || styles.info;
  };

  const allTips = [
    ...getGeneralTips(),
    ...getCropSpecificTips()
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-yellow-800">
              {currentLanguage === 'hi' ? '💡 Market Tips' : '💡 Market Tips'}
            </span>
            <div className="text-sm font-normal text-gray-600">
              {currentLanguage === 'hi' ? 'बेहतर मुनाफे के लिए सुझाव' : 'Tips for better profits'}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Seasonal Advice */}
        {seasonalAdvice && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">🌱</span>
              <div>
                <h4 className="font-medium text-green-800 text-sm mb-1">
                  {currentLanguage === 'hi' ? 'मौसमी सलाह' : 'Seasonal Advice'}
                </h4>
                <p className="text-sm text-green-700">
                  {typeof seasonalAdvice === 'object' 
                    ? seasonalAdvice[currentLanguage === 'hi' ? 'hi' : 'en']
                    : seasonalAdvice
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Market Insights */}
        {marketInsights && marketInsights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              {currentLanguage === 'hi' ? '📊 बाजार की जानकारी' : '📊 Market Insights'}
            </h4>
            {marketInsights.slice(0, 3).map((insight, index) => {
              const style = getTipStyle(insight.type);
              return (
                <div 
                  key={index}
                  className={`p-3 ${style.bg} ${style.border} border rounded-lg`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`${style.icon} mt-0.5`}>
                      {insight.type === 'positive' ? '📈' : 
                       insight.type === 'negative' ? '📉' : 'ℹ️'}
                    </span>
                    <p className={`text-sm ${style.text}`}>
                      {typeof insight.message === 'object'
                        ? insight.message[currentLanguage === 'hi' ? 'hi' : 'en']
                        : insight.message
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* General Tips */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">
            {currentLanguage === 'hi' ? '🎯 सामान्य सुझाव' : '🎯 General Tips'}
          </h4>
          {allTips.map((tip, index) => {
            const style = getTipStyle(tip.type);
            return (
              <div 
                key={index}
                className={`p-3 ${style.bg} ${style.border} border rounded-lg hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${style.icon} mt-0.5 flex-shrink-0`}>
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className={`font-medium text-sm ${style.text}`}>
                        {tip.title}
                      </h5>
                      {tip.priority === 'high' && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0 border-orange-300 text-orange-700"
                        >
                          {currentLanguage === 'hi' ? 'महत्वपूर्ण' : 'Important'}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${style.text} leading-relaxed`}>
                      {tip.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Tips */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">
            {currentLanguage === 'hi' ? '⚡ त्वरित कार्य' : '⚡ Quick Actions'}
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>
                {currentLanguage === 'hi' 
                  ? 'हर सुबह 9 बजे market rates check करें'
                  : 'Check market rates daily at 9 AM'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              <span>
                {currentLanguage === 'hi'
                  ? 'Transport cost भी selling decision में शामिल करें'
                  : 'Include transport costs in selling decisions'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <CheckCircle className="h-3 w-3 text-purple-600" />
              <span>
                {currentLanguage === 'hi'
                  ? 'बेचने से पहले कम से कम 3 markets की rates देखें'
                  : 'Check rates in at least 3 markets before selling'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketTips;
