// src/components/market/PriceCard.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const PriceCard = ({ 
  title, 
  price, 
  change, 
  trend, 
  type = 'modal', 
  className,
  icon 
}) => {
  const { currentLanguage } = useLanguage();

  const getCardStyle = () => {
    switch (type) {
      case 'min':
        return {
          bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          priceColor: 'text-green-700',
          titleColor: 'text-green-600'
        };
      case 'max':
        return {
          bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
          borderColor: 'border-red-200',
          priceColor: 'text-red-700',
          titleColor: 'text-red-600'
        };
      case 'modal':
      default:
        return {
          bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          priceColor: 'text-blue-700',
          titleColor: 'text-blue-600'
        };
    }
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-500" />;
    
    switch (trend) {
      case 'RISING':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'FALLING':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    if (!trend) return '';
    
    const trendTexts = {
      'RISING': currentLanguage === 'hi' ? 'बढ़ रहा' : 'Rising',
      'FALLING': currentLanguage === 'hi' ? 'गिर रहा' : 'Falling',
      'STABLE': currentLanguage === 'hi' ? 'स्थिर' : 'Stable'
    };
    
    return trendTexts[trend] || '';
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return `₹${price.toLocaleString('hi-IN')}`;
  };

  const cardStyle = getCardStyle();

  return (
    <Card className={cn(
      `${cardStyle.bgColor} ${cardStyle.borderColor} border-2 shadow-md hover:shadow-lg transition-all duration-200`,
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${cardStyle.titleColor}`}>
              {title}
            </h3>
            {icon && <div className="text-lg">{icon}</div>}
          </div>

          {/* Price */}
          <div className={`text-2xl font-bold ${cardStyle.priceColor}`}>
            {formatPrice(price)}
            <span className="text-sm font-medium text-gray-600 ml-1">
              /{currentLanguage === 'hi' ? 'क्विंटल' : 'quintal'}
            </span>
          </div>

          {/* Trend and Change */}
          <div className="flex items-center justify-between">
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="text-xs font-medium text-gray-600">
                  {getTrendText()}
                </span>
              </div>
            )}
            
            {change && (
              <Badge 
                variant={change > 0 ? "default" : "destructive"}
                className={cn(
                  "text-xs",
                  change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}
              >
                {change > 0 ? '+' : ''}{change}%
              </Badge>
            )}
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500">
            {currentLanguage === 'hi' ? 'कल से' : 'from yesterday'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
