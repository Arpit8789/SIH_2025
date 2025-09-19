// src/components/charts/PriceTrendChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const PriceTrendChart = ({ data, title, height = 300, showPredictions = false }) => {
  const { currentLanguage } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 {title || (currentLanguage === 'hi' ? '30-दिन मूल्य रुझान' : '30-Day Price Trend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            {currentLanguage === 'hi' ? 'डेटा उपलब्ध नहीं' : 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('hi-IN', { 
      day: '2-digit', 
      month: 'short' 
    }),
    price: item.modalPrice || item.price,
    minPrice: item.minPrice,
    maxPrice: item.maxPrice,
    isPrediction: item.isPrediction || false
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-600">
              {currentLanguage === 'hi' ? 'मॉडल मूल्य' : 'Modal Price'}: ₹{data.price?.toLocaleString()}
            </p>
            {data.minPrice && (
              <p className="text-blue-600">
                {currentLanguage === 'hi' ? 'न्यूनतम' : 'Min'}: ₹{data.minPrice?.toLocaleString()}
              </p>
            )}
            {data.maxPrice && (
              <p className="text-red-600">
                {currentLanguage === 'hi' ? 'अधिकतम' : 'Max'}: ₹{data.maxPrice?.toLocaleString()}
              </p>
            )}
            {data.isPrediction && (
              <p className="text-orange-600 font-medium">
                {currentLanguage === 'hi' ? '(पूर्वानुमान)' : '(Prediction)'}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 {title || (currentLanguage === 'hi' ? '30-दिन मूल्य रुझान' : '30-Day Price Trend')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical data area */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
            />
            
            {/* Prediction line (if enabled) */}
            {showPredictions && (
              <Line
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{currentLanguage === 'hi' ? 'वास्तविक मूल्य' : 'Actual Price'}</span>
          </div>
          {showPredictions && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{currentLanguage === 'hi' ? 'पूर्वानुमान' : 'Prediction'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;
