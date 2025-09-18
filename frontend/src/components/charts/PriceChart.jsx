// src/components/charts/PriceChart.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner, { PriceLoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { marketService } from '@/services/marketService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';

const PriceChart = ({ 
  cropId, 
  cropName, 
  height = 400, 
  showComparison = false,
  className 
}) => {
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState(['average', 'minimum', 'maximum']);
  const [error, setError] = useState(null);

  const { t } = useLanguage();

  const timeRangeOptions = [
    { value: '7d', label: t('charts.last7Days') },
    { value: '30d', label: t('charts.last30Days') },
    { value: '90d', label: t('charts.last3Months') },
    { value: '1y', label: t('charts.lastYear') }
  ];

  const chartTypeOptions = [
    { value: 'line', label: t('charts.lineChart') },
    { value: 'area', label: t('charts.areaChart') }
  ];

  // Load price data from backend
  useEffect(() => {
    loadPriceData();
  }, [cropId, timeRange]);

  const loadPriceData = async () => {
    if (!cropId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call backend API for price history
      const response = await marketService.getPriceHistory({
        cropId,
        timeRange,
        includeMetrics: ['average', 'minimum', 'maximum', 'volume']
      });

      if (response.success) {
        // Transform backend data for chart
        const transformedData = response.data.priceHistory.map(item => ({
          date: item.date,
          formattedDate: dateHelpers.formatDate(item.date, 'MMM dd'),
          fullDate: dateHelpers.formatDate(item.date, 'MMM dd, yyyy'),
          average: item.priceData.average,
          minimum: item.priceData.minimum,
          maximum: item.priceData.maximum,
          volume: item.volume || 0,
          trend: item.trend,
          changePercent: item.changePercent || 0
        }));

        setPriceData(transformedData);
      } else {
        throw new Error(response.message || 'Failed to load price data');
      }
    } catch (error) {
      console.error('Failed to load price data:', error);
      setError(error.message || t('charts.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip for price chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">
            📅 {data.fullDate}
          </p>
          {payload.map((entry, index) => {
            const value = entry.value;
            const color = entry.color;
            const metricName = entry.dataKey;
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm capitalize">
                    {t(`charts.${metricName}`)}:
                  </span>
                </div>
                <span className="font-medium text-primary">
                  {numberHelpers.formatCurrency(value)}
                </span>
              </div>
            );
          })}
          
          {/* Volume info */}
          {data.volume > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('charts.volume')}:
                </span>
                <span className="text-xs font-medium">
                  {numberHelpers.formatNumber(data.volume)} tons
                </span>
              </div>
            </div>
          )}

          {/* Trend indicator */}
          {data.changePercent !== 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                {data.changePercent > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : data.changePercent < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-500" />
                )}
                <span className={`text-xs font-medium ${
                  data.changePercent > 0 ? 'text-green-600' : 
                  data.changePercent < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {data.changePercent > 0 ? '+' : ''}{numberHelpers.formatPercentage(data.changePercent)}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate price statistics
  const getPriceStats = () => {
    if (!priceData.length) return null;

    const currentPrice = priceData[priceData.length - 1];
    const previousPrice = priceData[priceData.length - 2];
    
    const change = previousPrice ? 
      ((currentPrice.average - previousPrice.average) / previousPrice.average) * 100 : 0;

    const highestPrice = Math.max(...priceData.map(d => d.maximum));
    const lowestPrice = Math.min(...priceData.map(d => d.minimum));
    const avgPrice = priceData.reduce((sum, d) => sum + d.average, 0) / priceData.length;

    return {
      current: currentPrice.average,
      change,
      highest: highestPrice,
      lowest: lowestPrice,
      average: avgPrice
    };
  };

  const stats = getPriceStats();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <PriceLoadingSpinner text={t('charts.loadingPrices')} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-red-500 mb-2">❌ {error}</p>
            <button 
              onClick={loadPriceData}
              className="text-primary hover:underline text-sm"
            >
              {t('common.retry')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              💰 {cropName} {t('charts.priceAnalysis')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('charts.priceSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Statistics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('charts.currentPrice')}</p>
              <p className="text-lg font-bold text-primary">
                {numberHelpers.formatCurrency(stats.current)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : stats.change < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-500" />
                )}
                <span className={`text-xs ${
                  stats.change > 0 ? 'text-green-600' : 
                  stats.change < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stats.change > 0 ? '+' : ''}{numberHelpers.formatPercentage(stats.change)}
                </span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('charts.highestPrice')}</p>
              <p className="text-lg font-bold text-green-600">
                {numberHelpers.formatCurrency(stats.highest)}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('charts.lowestPrice')}</p>
              <p className="text-lg font-bold text-red-600">
                {numberHelpers.formatCurrency(stats.lowest)}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('charts.avgPrice')}</p>
              <p className="text-lg font-bold text-blue-600">
                {numberHelpers.formatCurrency(stats.average)}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {selectedMetrics.includes('maximum') && (
                  <Area
                    type="monotone"
                    dataKey="maximum"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    name={t('charts.maximum')}
                  />
                )}
                
                <Area
                  type="monotone"
                  dataKey="average"
                  stackId="2"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  name={t('charts.average')}
                />
                
                {selectedMetrics.includes('minimum') && (
                  <Area
                    type="monotone"
                    dataKey="minimum"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.1}
                    name={t('charts.minimum')}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  name={t('charts.average')}
                />
                
                {selectedMetrics.includes('maximum') && (
                  <Line
                    type="monotone"
                    dataKey="maximum"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={t('charts.maximum')}
                  />
                )}
                
                {selectedMetrics.includes('minimum') && (
                  <Line
                    type="monotone"
                    dataKey="minimum"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={t('charts.minimum')}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>{t('charts.averagePrice')}</span>
          </div>
          {selectedMetrics.includes('maximum') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500 rounded-full"></div>
              <span>{t('charts.highestPrice')}</span>
            </div>
          )}
          {selectedMetrics.includes('minimum') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-green-500 rounded-full"></div>
              <span>{t('charts.lowestPrice')}</span>
            </div>
          )}
        </div>

        {/* Data source */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          📊 {t('charts.dataSource')}: {t('charts.liveMarketData')} • {t('charts.lastUpdated')}: {dateHelpers.formatRelativeTime(new Date())}
        </p>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
