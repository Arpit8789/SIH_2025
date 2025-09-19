// src/utils/priceCalculations.js
import cropsData from '@/data/crops1.json';
import seasonalityData from '@/data/seasonality.json';

export const calculateTrend = (priceHistory) => {
  if (!priceHistory || priceHistory.length < 7) {
    return { trend: 'INSUFFICIENT_DATA', confidence: 0 };
  }

  const recent7Days = priceHistory.slice(-7);
  const previous7Days = priceHistory.slice(-14, -7);

  if (previous7Days.length === 0) {
    return { trend: 'INSUFFICIENT_DATA', confidence: 0 };
  }

  const recentAvg = recent7Days.reduce((sum, p) => sum + p.modalPrice, 0) / recent7Days.length;
  const previousAvg = previous7Days.reduce((sum, p) => sum + p.modalPrice, 0) / previous7Days.length;
  
  const percentChange = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  let trend, confidence;
  
  if (percentChange > 5) {
    trend = 'RISING';
    confidence = Math.min(90, 60 + Math.abs(percentChange) * 2);
  } else if (percentChange < -5) {
    trend = 'FALLING';
    confidence = Math.min(90, 60 + Math.abs(percentChange) * 2);
  } else {
    trend = 'STABLE';
    confidence = 70;
  }

  return { trend, confidence: Math.round(confidence), percentChange: percentChange.toFixed(1) };
};

export const calculateVolatility = (priceHistory) => {
  if (!priceHistory || priceHistory.length < 7) return 0;
  
  const prices = priceHistory.slice(-30).map(d => d.modalPrice);
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.round((stdDev / mean) * 100);
};

export const generateRecommendation = (cropId, currentPrice, priceHistory, currentMonth) => {
  const crop = cropsData.crops.find(c => c.id === cropId);
  const seasonPattern = seasonalityData.pricePatterns[cropId];
  
  if (!crop || !seasonPattern) {
    return {
      action: 'WAIT',
      confidence: 30,
      reason: { 
        en: 'Insufficient data for recommendation',
        hi: 'सिफारिश के लिए अपर्याप्त डेटा',
        pa: 'ਸਿਫਾਰਸ਼ ਲਈ ਨਾਕਾਫ਼ੀ ਡੇਟਾ'
      }
    };
  }

  const trendAnalysis = calculateTrend(priceHistory);
  const volatility = calculateVolatility(priceHistory);
  const isHighPricePeriod = seasonPattern.highPriceMonths.includes(currentMonth);
  const isLowPricePeriod = seasonPattern.lowPriceMonths.includes(currentMonth);

  let recommendation = { action: 'WAIT', confidence: 50 };
  let reasonKey = '';

  // AI Decision Logic
  if (isHighPricePeriod && trendAnalysis.trend === 'RISING') {
    recommendation = { action: 'SELL', confidence: 85 };
    reasonKey = 'peak_season_rising';
  } else if (isHighPricePeriod && trendAnalysis.trend === 'STABLE') {
    recommendation = { action: 'SELL', confidence: 75 };
    reasonKey = 'peak_season_stable';
  } else if (isLowPricePeriod && trendAnalysis.trend === 'FALLING') {
    recommendation = { action: 'HOLD', confidence: 80 };
    reasonKey = 'low_season_falling';
  } else if (trendAnalysis.trend === 'RISING' && volatility < 15) {
    recommendation = { action: 'HOLD', confidence: 70 };
    reasonKey = 'rising_low_volatility';
  } else if (trendAnalysis.trend === 'FALLING' && volatility > 20) {
    recommendation = { action: 'SELL', confidence: 75 };
    reasonKey = 'falling_high_volatility';
  } else if (isHighPricePeriod) {
    recommendation = { action: 'SELL', confidence: 65 };
    reasonKey = 'general_peak_season';
  }

  const reasons = {
    peak_season_rising: {
      en: `Peak ${crop.name.en} season with rising prices. Excellent time to sell.`,
      hi: `${crop.name.hi} का चरम मौसम और बढ़ते दाम। बेचने का बेहतरीन समय।`,
      pa: `${crop.name.pa} ਦਾ ਚੋਟੀ ਦਾ ਮੌਸਮ ਅਤੇ ਵਧਦੇ ਭਾਅ। ਵੇਚਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ।`
    },
    peak_season_stable: {
      en: `Peak season for ${crop.name.en}. Stable prices suggest good selling opportunity.`,
      hi: `${crop.name.hi} का चरम मौसम। स्थिर दाम अच्छा बेचने का अवसर दिखाते हैं।`,
      pa: `${crop.name.pa} ਦਾ ਚੋਟੀ ਦਾ ਮੌਸਮ। ਸਥਿਰ ਭਾਅ ਚੰਗਾ ਵੇਚਣ ਦਾ ਮੌਕਾ ਦਿਖਾਉਂਦੇ ਹਨ।`
    },
    low_season_falling: {
      en: `Low price season with falling trend. Better to hold and wait.`,
      hi: `कम दाम का मौसम और गिरते भाव। रुकना और इंतजार करना बेहतर।`,
      pa: `ਘੱਟ ਭਾਅ ਦਾ ਮੌਸਮ ਅਤੇ ਗਿਰਦੇ ਭਾਅ। ਰੁਕਣਾ ਅਤੇ ਇੰਤਜ਼ਾਰ ਕਰਨਾ ਬਿਹਤਰ।`
    },
    rising_low_volatility: {
      en: `Prices rising steadily with low volatility. Hold for better rates.`,
      hi: `कम उतार-चढ़ाव के साथ दाम लगातार बढ़ रहे हैं। बेहतर दरों के लिए रुकें।`,
      pa: `ਘੱਟ ਉਤਾਰ-ਚੜ੍ਹਾਅ ਨਾਲ ਭਾਅ ਲਗਾਤਾਰ ਵਧ ਰਹੇ ਹਨ। ਬਿਹਤਰ ਦਰਾਂ ਲਈ ਰੁਕੋ।`
    },
    falling_high_volatility: {
      en: `Falling prices with high volatility. Sell before further decline.`,
      hi: `अधिक उतार-चढ़ाव के साथ गिरते दाम। और गिरावट से पहले बेच दें।`,
      pa: `ਜ਼ਿਆਦਾ ਉਤਾਰ-ਚੜ੍ਹਾਅ ਨਾਲ ਗਿਰਦੇ ਭਾਅ। ਹੋਰ ਗਿਰਾਵਟ ਤੋਂ ਪਹਿਲਾਂ ਵੇਚੋ।`
    },
    general_peak_season: {
      en: `Generally good time to sell ${crop.name.en} in current season.`,
      hi: `वर्तमान मौसम में ${crop.name.hi} बेचने का आमतौर पर अच्छा समय।`,
      pa: `ਮੌਜੂਦਾ ਮੌਸਮ ਵਿੱਚ ${crop.name.pa} ਵੇਚਣ ਦਾ ਆਮ ਤੌਰ 'ਤੇ ਚੰਗਾ ਸਮਾਂ।`
    }
  };

  recommendation.reason = reasons[reasonKey] || reasons.general_peak_season;
  recommendation.trendData = trendAnalysis;
  recommendation.volatility = volatility;

  return recommendation;
};

export const predictNextWeekPrices = (priceHistory) => {
  if (!priceHistory || priceHistory.length < 14) return [];

  const predictions = [];
  const lastPrice = priceHistory[priceHistory.length - 1].modalPrice;
  const avgDailyChange = calculateAverageChange(priceHistory);
  
  for (let i = 1; i <= 7; i++) {
    const predictedPrice = lastPrice + (avgDailyChange * i);
    const confidence = Math.max(40, 85 - (i * 6));
    
    predictions.push({
      day: i,
      predictedPrice: Math.round(Math.max(0, predictedPrice)),
      confidence: Math.round(confidence),
      date: getDateAfterDays(i)
    });
  }
  
  return predictions;
};

const calculateAverageChange = (priceHistory) => {
  if (priceHistory.length < 2) return 0;
  
  const changes = [];
  for (let i = 1; i < Math.min(priceHistory.length, 15); i++) {
    changes.push(priceHistory[i].modalPrice - priceHistory[i-1].modalPrice);
  }
  
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
};

const getDateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
