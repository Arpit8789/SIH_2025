// src/components/market/QuickStats.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const QuickStats = ({ stats, loading = false }) => {
  const { currentLanguage } = useLanguage();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {currentLanguage === 'hi' ? 'त्वरित आंकड़े' : 'Quick Stats'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {currentLanguage === 'hi' ? 'त्वरित आंकड़े' : 'Quick Stats'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            {currentLanguage === 'hi' ? 'आंकड़े उपलब्ध नहीं' : 'No stats available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('hi-IN')}`;
  };

  const getVolatilityColor = (volatility) => {
    if (volatility < 10) return 'text-green-600 bg-green-100';
    if (volatility < 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVolatilityText = (volatility) => {
    if (volatility < 10) return currentLanguage === 'hi' ? 'कम' : 'Low';
    if (volatility < 20) return currentLanguage === 'hi' ? 'मध्यम' : 'Medium';
    return currentLanguage === 'hi' ? 'उच्च' : 'High';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 {currentLanguage === 'hi' ? 'त्वरित आंकड़े' : 'Quick Stats'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Weekly High */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                {currentLanguage === 'hi' ? 'साप्ताहिक उच्च' : 'Weekly High'}
              </span>
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(stats.weeklyHigh)}
            </div>
          </div>

          {/* Weekly Low */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600">
                {currentLanguage === 'hi' ? 'साप्ताहिक निम्न' : 'Weekly Low'}
              </span>
            </div>
            <div className="text-xl font-bold text-red-700">
              {formatCurrency(stats.weeklyLow)}
            </div>
          </div>

          {/* Monthly Average */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                {currentLanguage === 'hi' ? 'मासिक औसत' : 'Monthly Avg'}
              </span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(stats.monthlyAvg)}
            </div>
          </div>

          {/* Volatility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                {currentLanguage === 'hi' ? 'अस्थिरता' : 'Volatility'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-700">
                {stats.volatility || 0}%
              </span>
              <Badge className={getVolatilityColor(stats.volatility || 0)}>
                {getVolatilityText(stats.volatility || 0)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Additional insights */}
        {stats.insights && stats.insights.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {currentLanguage === 'hi' ? '💡 मुख्य बातें' : '💡 Key Insights'}
            </h4>
            <div className="space-y-2">
              {stats.insights.slice(0, 2).map((insight, index) => (
                <div 
                  key={index}
                  className={`text-xs p-2 rounded flex items-start gap-2 ${
                    insight.type === 'positive' ? 'bg-green-50 text-green-700' :
                    insight.type === 'negative' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  <span className="text-sm">
                    {insight.type === 'positive' ? '📈' : insight.type === 'negative' ? '📉' : 'ℹ️'}
                  </span>
                  <span>
                    {typeof insight.message === 'object' 
                      ? insight.message[currentLanguage === 'hi' ? 'hi' : 'en']
                      : insight.message
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickStats;
