// src/hooks/useMarketData.js
import { useState, useEffect, useCallback } from 'react';
import predictionService from '@/services/predictionService';
import { useLanguage } from '@/hooks/useLanguage';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { currentLanguage } = useLanguage();

  const fetchMarketData = useCallback(async (cropId, state, market = '') => {
    if (!cropId || !state) {
      setError('Crop and state are required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Fetching market data for ${cropId} in ${state}`);
      
      const analysis = await predictionService.generateMarketAnalysis(cropId, state, market);
      
      setMarketData(analysis);
      setLastUpdated(new Date());
      
      console.log('✅ Market data updated successfully');
      
    } catch (err) {
      console.error('❌ Failed to fetch market data:', err);
      setError(err.message || 'Failed to fetch market data');
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    if (marketData?.current) {
      fetchMarketData(
        marketData.current.commodity.toLowerCase(),
        marketData.current.state.toLowerCase(),
        marketData.current.market
      );
    }
  }, [marketData, fetchMarketData]);

  const clearData = useCallback(() => {
    setMarketData(null);
    setError(null);
    setLastUpdated(null);
  }, []);

  // Auto-refresh every 5 minutes if data exists
  useEffect(() => {
    if (marketData && !loading) {
      const intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing market data');
        refreshData();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [marketData, loading, refreshData]);

  return {
    marketData,
    loading,
    error,
    lastUpdated,
    fetchMarketData,
    refreshData,
    clearData,
    // Helper getters
    hasData: !!marketData,
    currentPrice: marketData?.current?.modalPrice || 0,
    trend: marketData?.trend?.trend || 'STABLE',
    recommendation: marketData?.recommendation?.action || 'WAIT',
    confidence: marketData?.recommendation?.confidence || 0
  };
};

// Hook for multiple crops comparison
export const useMultiCropData = () => {
  const [cropDataList, setCropDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMultipleCrops = useCallback(async (crops) => {
    if (!crops || crops.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const promises = crops.map(crop => 
        predictionService.generateMarketAnalysis(crop.id, crop.state, crop.market)
      );

      const results = await Promise.allSettled(promises);
      
      const successfulData = results
        .map((result, index) => ({
          ...crops[index],
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason.message : null
        }))
        .filter(item => item.data !== null);

      setCropDataList(successfulData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cropDataList,
    loading,
    error,
    fetchMultipleCrops,
    clearData: () => setCropDataList([])
  };
};
