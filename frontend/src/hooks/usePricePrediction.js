// src/hooks/usePricePrediction.js
import { useState, useEffect, useMemo } from 'react';
import { generateRecommendation, predictNextWeekPrices } from '@/utils/priceCalculations';

export const usePricePrediction = (cropId, currentPrice, priceHistory) => {
  const [predictions, setPredictions] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate predictions when data changes
  useEffect(() => {
    if (!cropId || !currentPrice || !priceHistory || priceHistory.length < 7) {
      setPredictions([]);
      setRecommendation(null);
      return;
    }

    setLoading(true);

    try {
      // Generate price predictions
      const weekPredictions = predictNextWeekPrices(priceHistory);
      setPredictions(weekPredictions);

      // Generate recommendation
      const currentMonth = new Date().getMonth() + 1;
      const rec = generateRecommendation(cropId, currentPrice, priceHistory, currentMonth);
      setRecommendation(rec);

    } catch (error) {
      console.error('Error generating predictions:', error);
      setPredictions([]);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  }, [cropId, currentPrice, priceHistory]);

  // Memoized analysis
  const analysis = useMemo(() => {
    if (!predictions.length || !recommendation) return null;

    const avgPredictedPrice = predictions.reduce((sum, p) => sum + p.predictedPrice, 0) / predictions.length;
    const priceDirection = avgPredictedPrice > currentPrice ? 'UP' : avgPredictedPrice < currentPrice ? 'DOWN' : 'STABLE';
    const potentialGain = ((avgPredictedPrice - currentPrice) / currentPrice) * 100;

    return {
      direction: priceDirection,
      potentialGain: potentialGain.toFixed(1),
      avgConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
      bestDay: predictions.reduce((best, current) => 
        current.predictedPrice > best.predictedPrice ? current : best, predictions[0]),
      worstDay: predictions.reduce((worst, current) => 
        current.predictedPrice < worst.predictedPrice ? current : worst, predictions[0])
    };
  }, [predictions, currentPrice]);

  return {
    predictions,
    recommendation,
    analysis,
    loading,
    hasData: predictions.length > 0 && recommendation !== null
  };
};

// Hook for price alerts
export const usePriceAlert = (targetPrice, currentPrice, cropName) => {
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!targetPrice || !currentPrice) return;

    if (currentPrice >= targetPrice && !alertTriggered) {
      setAlertTriggered(true);
      setAlertMessage(`${cropName} has reached your target price of ₹${targetPrice}`);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Price Alert!', {
          body: `${cropName} price: ₹${currentPrice} (Target: ₹${targetPrice})`,
          icon: '/favicon.ico'
        });
      }
    } else if (currentPrice < targetPrice && alertTriggered) {
      setAlertTriggered(false);
    }
  }, [targetPrice, currentPrice, cropName, alertTriggered]);

  const resetAlert = () => {
    setAlertTriggered(false);
    setAlertMessage('');
  };

  return {
    alertTriggered,
    alertMessage,
    resetAlert
  };
};
