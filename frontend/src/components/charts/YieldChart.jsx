// src/components/charts/YieldChart.jsx
import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner, { CropLoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { farmerService } from '@/services/farmerService';
import { cropService } from '@/services/cropService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';

const YieldChart = ({ 
  farmerId, 
  height = 400, 
  showProjections = true,
  className 
}) => {
  const [yieldData, setYieldData] = useState([]);
  const [cropComparison, setCropComparison] = useState([]);
  const [yieldStats, setYieldStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trends');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [timeRange, setTimeRange] = useState('5y');
  const [chartType, setChartType] = useState('combined');
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { t } = useLanguage();

  const timeRangeOptions = [
    { value: '1y', label: t('charts.lastYear') },
    { value: '3y', label: t('charts.last3Years') },
    { value: '5y', label: t('charts.last5Years') },
    { value: 'all', label: t('charts.allTime') }
  ];

  const chartTypeOptions = [
    { value: 'combined', label: t('charts.combined'), icon: BarChart3 },
    { value: 'line', label: t('charts.lineChart'), icon: Activity },
    { value: 'comparison', label: t('charts.comparison'), icon: PieChartIcon }
  ];

  // Load yield data from backend
  useEffect(() => {
    loadYieldData();
  }, [farmerId, selectedCrop, timeRange]);

  const loadYieldData = async () => {
    const currentFarmerId = farmerId || user?.id;
    if (!currentFarmerId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call backend API for yield analytics
      const response = await farmerService.getYieldAnalytics({
        farmerId: currentFarmerId,
        cropId: selectedCrop !== 'all' ? selectedCrop : undefined,
        timeRange,
        includeProjections: showProjections,
        includeComparisons: true
      });

      if (response.success) {
        const data = response.data;
        
        // Transform historical yield data
        const transformedYieldData = data.historicalData.map(item => ({
          year: item.year,
          season: item.season,
          formattedPeriod: `${item.season} ${item.year}`,
          actualYield: item.actualYield,
          expectedYield: item.expectedYield || 0,
          projectedYield: item.projectedYield || 0,
          yieldEfficiency: item.actualYield && item.expectedYield ? 
            ((item.actualYield / item.expectedYield) * 100) : 0,
          cropName: item.cropName,
          cropCategory: item.cropCategory,
          climateImpact: item.factors?.climate || 0,
          soilQuality: item.factors?.soilQuality || 0,
          irrigationEfficiency: item.factors?.irrigation || 0,
          fertilizerUsage: item.factors?.fertilizer || 0,
          pestManagement: item.factors?.pestControl || 0,
          profitPerAcre: item.economics?.profitPerAcre || 0,
          costPerAcre: item.economics?.costPerAcre || 0,
          marketPrice: item.economics?.averagePrice || 0
        }));

        // Transform crop comparison data
        const transformedCropComparison = data.cropComparison.map(item => ({
          cropName: item.cropName,
          category: item.category,
          averageYield: item.averageYield,
          maxYield: item.maxYield,
          minYield: item.minYield,
          yieldVariation: item.yieldVariation,
          profitability: item.profitability,
          riskLevel: item.riskLevel,
          adaptability: item.adaptability,
          marketDemand: item.marketDemand,
          color: getCropColor(item.category)
        }));

        setYieldData(transformedYieldData);
        setCropComparison(transformedCropComparison);
        setYieldStats(data.statistics);
      } else {
        throw new Error(response.message || 'Failed to load yield data');
      }
    } catch (error) {
      console.error('Failed to load yield data:', error);
      setError(error.message || t('charts.yieldLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getCropColor = (category) => {
    const colors = {
      cereals: '#f59e0b',
      pulses: '#10b981',
      vegetables: '#06b6d4',
      fruits: '#f472b6',
      spices: '#ef4444',
      oilseeds: '#8b5cf6'
    };
    return colors[category?.toLowerCase()] || '#6b7280';
  };

  // Custom tooltip for yield chart
  const CustomYieldTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg min-w-[240px]">
          <p className="font-medium text-foreground mb-3">
            🌾 {data.formattedPeriod}
          </p>
          
          <div className="space-y-2">
            {/* Yield Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Actual Yield</p>
                <p className="text-sm font-bold text-primary">
                  {numberHelpers.formatNumber(data.actualYield)} tons/acre
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {numberHelpers.formatNumber(data.expectedYield)} tons/acre
                </p>
              </div>
            </div>

            {/* Efficiency */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Efficiency:</span>
              <div className="flex items-center gap-2">
                {data.yieldEfficiency >= 100 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  data.yieldEfficiency >= 100 ? 'text-green-600' : 
                  data.yieldEfficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {numberHelpers.formatPercentage(data.yieldEfficiency)}
                </span>
              </div>
            </div>

            {/* Economic data */}
            {data.profitPerAcre > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Profit/Acre</p>
                    <p className="font-medium text-green-600">
                      {numberHelpers.formatCurrency(data.profitPerAcre)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Price</p>
                    <p className="font-medium">
                      {numberHelpers.formatCurrency(data.marketPrice)}/ton
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key factors */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Key Factors:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Climate:</span>
                  <span className="font-medium">{data.climateImpact}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Soil:</span>
                  <span className="font-medium">{data.soilQuality}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Irrigation:</span>
                  <span className="font-medium">{data.irrigationEfficiency}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Fertilizer:</span>
                  <span className="font-medium">{data.fertilizerUsage}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Crop comparison tooltip
  const CropComparisonTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">
            🌱 {data.cropName}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Avg Yield:</span>
              <span className="font-medium">{numberHelpers.formatNumber(data.averageYield)} tons/acre</span>
            </div>
            <div className="flex justify-between">
              <span>Profitability:</span>
              <Badge variant={data.profitability > 70 ? 'success' : data.profitability > 40 ? 'warning' : 'destructive'}>
                {data.profitability}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <Badge variant={data.riskLevel === 'low' ? 'success' : data.riskLevel === 'medium' ? 'warning' : 'destructive'}>
                {data.riskLevel}
              </Badge>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <CropLoadingSpinner text={t('charts.loadingYield')} />
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
              onClick={loadYieldData}
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
              <Target className="h-5 w-5 text-primary" />
              {t('charts.yieldAnalysis')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('charts.yieldSubtitle')}
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
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Yield Statistics */}
        {yieldStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Best Yield</p>
              </div>
              <p className="text-lg font-bold text-green-600">
                {numberHelpers.formatNumber(yieldStats.maxYield)} tons/acre
              </p>
              <p className="text-xs text-muted-foreground">
                {yieldStats.bestCrop} • {yieldStats.bestYear}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-muted-foreground">Avg Yield</p>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {numberHelpers.formatNumber(yieldStats.averageYield)} tons/acre
              </p>
              <div className="flex items-center gap-1 mt-1">
                {yieldStats.yieldTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${yieldStats.yieldTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {yieldStats.yieldTrend > 0 ? '+' : ''}{numberHelpers.formatPercentage(yieldStats.yieldTrend)}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
              <p className="text-lg font-bold text-yellow-600">
                {numberHelpers.formatPercentage(yieldStats.averageEfficiency)}
              </p>
              <Progress value={yieldStats.averageEfficiency} className="mt-2 h-1" />
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-600">💰</span>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {numberHelpers.formatCurrency(yieldStats.totalProfit)}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeRange === '1y' ? 'This year' : `Last ${timeRange}`}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Yield Trends</TabsTrigger>
            <TabsTrigger value="comparison">Crop Comparison</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-6">
            <div style={{ height: `${height}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'combined' ? (
                  <ComposedChart data={yieldData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="formattedPeriod" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      yAxisId="yield"
                      tickFormatter={(value) => `${value}t`}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="efficiency"
                      orientation="right"
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomYieldTooltip />} />
                    <Legend />
                    
                    <Bar
                      yAxisId="yield"
                      dataKey="actualYield"
                      fill="hsl(var(--primary))"
                      radius={[2, 2, 0, 0]}
                      name="Actual Yield (tons/acre)"
                    />
                    <Bar
                      yAxisId="yield"
                      dataKey="expectedYield"
                      fill="#94a3b8"
                      radius={[2, 2, 0, 0]}
                      name="Expected Yield (tons/acre)"
                    />
                    {showProjections && (
                      <Line
                        yAxisId="yield"
                        type="monotone"
                        dataKey="projectedYield"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#f59e0b' }}
                        name="Projected Yield"
                      />
                    )}
                    <Line
                      yAxisId="efficiency"
                      type="monotone"
                      dataKey="yieldEfficiency"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      name="Efficiency %"
                    />
                    <ReferenceLine yAxisId="efficiency" y={100} stroke="#22c55e" strokeDasharray="2 2" />
                  </ComposedChart>
                ) : (
                  <LineChart data={yieldData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="formattedPeriod" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}t`}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomYieldTooltip />} />
                    <Legend />
                    
                    <Line
                      type="monotone"
                      dataKey="actualYield"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'hsl(var(--primary))' }}
                      name="Actual Yield (tons/acre)"
                    />
                    <Line
                      type="monotone"
                      dataKey="expectedYield"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#94a3b8' }}
                      name="Expected Yield"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart for Crop Yield Distribution */}
              <div>
                <h4 className="font-medium mb-4">Crop Yield Distribution</h4>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cropComparison}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="averageYield"
                        label={({ name, value }) => `${name}: ${numberHelpers.formatNumber(value)}t`}
                      >
                        {cropComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CropComparisonTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radial Chart for Profitability */}
              <div>
                <h4 className="font-medium mb-4">Crop Profitability Index</h4>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={cropComparison}>
                      <RadialBar
                        dataKey="profitability"
                        cornerRadius={10}
                        fill="hsl(var(--primary))"
                        label={{ position: 'insideStart', fill: '#fff' }}
                      />
                      <Tooltip content={<CropComparisonTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Factors */}
              <div className="space-y-4">
                <h4 className="font-medium">Performance Factors</h4>
                {yieldStats?.factors && Object.entries(yieldStats.factors).map(([factor, score]) => (
                  <div key={factor} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium">{score}/10</span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium">AI Recommendations</h4>
                {yieldStats?.recommendations?.map((rec, index) => (
                  <div key={index} className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{rec.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          Impact: +{rec.expectedImprovement}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Data source */}
        <p className="text-xs text-muted-foreground mt-6 text-center">
          📊 {t('charts.dataSource')}: {t('charts.farmRecords')} • {t('charts.lastUpdated')}: {dateHelpers.formatRelativeTime(new Date())}
        </p>
      </CardContent>
    </Card>
  );
};

export default YieldChart;
