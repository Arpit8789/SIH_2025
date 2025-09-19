// src/components/charts/ComparisonChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const ComparisonChart = ({ data, title, height = 300 }) => {
  const { currentLanguage } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {title || (currentLanguage === 'hi' ? 'मूल्य तुलना' : 'Price Comparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            {currentLanguage === 'hi' ? 'तुलना डेटा उपलब्ध नहीं' : 'No comparison data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ₹{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 {title || (currentLanguage === 'hi' ? 'मूल्य तुलना' : 'Price Comparison')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
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
            <Legend />
            <Bar 
              dataKey="currentPrice" 
              name={currentLanguage === 'hi' ? 'वर्तमान मूल्य' : 'Current Price'}
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="avgPrice" 
              name={currentLanguage === 'hi' ? 'औसत मूल्य' : 'Average Price'}
              fill="#6b7280" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;
