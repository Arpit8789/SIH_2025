// src/services/predictionService.js
import { calculateTrend, calculateVolatility, generateRecommendation, predictNextWeekPrices } from '@/utils/priceCalculations';
import marketDataService from './marketDataService';
import cropsData from '@/data/crops1.json';
import seasonalityData from '@/data/seasonality.json';

class PredictionService {
  constructor() {
    this.currentMonth = new Date().getMonth() + 1;
  }

  // Generate complete market analysis with AI recommendations
  async generateMarketAnalysis(cropId, state, market) {
    try {
      console.log(`🧠 Generating analysis for ${cropId} in ${state}`);
      
      // Fetch current and historical data
      const [currentData, historicalData] = await Promise.all([
        marketDataService.fetchCurrentPrices(cropId, state, market),
        marketDataService.fetchHistoricalPrices(cropId, state, market, 30)
      ]);

      if (!currentData) {
        throw new Error('Unable to fetch current market data');
      }

      // Generate AI analysis
      const trendAnalysis = calculateTrend(historicalData);
      const volatility = calculateVolatility(historicalData);
      const recommendation = generateRecommendation(
        cropId, 
        currentData.modalPrice, 
        historicalData, 
        this.currentMonth
      );
      const predictions = predictNextWeekPrices(historicalData);
      const marketInsights = this.generateMarketInsights(cropId, currentData, trendAnalysis);
      const seasonalAdvice = this.getSeasonalAdvice(cropId, this.currentMonth);

      return {
        current: currentData,
        trend: trendAnalysis,
        volatility: volatility,
        recommendation: recommendation,
        predictions: predictions,
        insights: marketInsights,
        seasonalAdvice: seasonalAdvice,
        historicalData: historicalData.slice(-15), // Last 15 days for charts
        lastUpdated: new Date().toISOString(),
        confidence: this.calculateOverallConfidence(trendAnalysis, volatility, historicalData.length)
      };

    } catch (error) {
      console.error('❌ Failed to generate market analysis:', error);
      throw error;
    }
  }

  // Generate market insights and tips
  generateMarketInsights(cropId, currentData, trendAnalysis) {
    const crop = cropsData.crops.find(c => c.id === cropId);
    const seasonPattern = seasonalityData.pricePatterns[cropId];
    
    const insights = [];

    // Price comparison with average
    if (currentData.modalPrice > crop.avgPrice * 1.1) {
      insights.push({
        type: 'positive',
        message: {
          en: `Current price is ${Math.round(((currentData.modalPrice / crop.avgPrice) - 1) * 100)}% above average`,
          hi: `वर्तमान दाम औसत से ${Math.round(((currentData.modalPrice / crop.avgPrice) - 1) * 100)}% अधिक है`,
          pa: `ਮੌਜੂਦਾ ਭਾਅ ਔਸਤ ਨਾਲੋਂ ${Math.round(((currentData.modalPrice / crop.avgPrice) - 1) * 100)}% ਜ਼ਿਆਦਾ ਹੈ`
        }
      });
    } else if (currentData.modalPrice < crop.avgPrice * 0.9) {
      insights.push({
        type: 'negative',
        message: {
          en: `Current price is ${Math.round((1 - (currentData.modalPrice / crop.avgPrice)) * 100)}% below average`,
          hi: `वर्तमान दाम औसत से ${Math.round((1 - (currentData.modalPrice / crop.avgPrice)) * 100)}% कम है`,
          pa: `ਮੌਜੂਦਾ ਭਾਅ ਔਸਤ ਨਾਲੋਂ ${Math.round((1 - (currentData.modalPrice / crop.avgPrice)) * 100)}% ਘੱਟ ਹੈ`
        }
      });
    }

    // Trend insights
    if (trendAnalysis.trend === 'RISING' && trendAnalysis.confidence > 70) {
      insights.push({
        type: 'positive',
        message: {
          en: `Strong upward trend detected with ${trendAnalysis.confidence}% confidence`,
          hi: `${trendAnalysis.confidence}% विश्वसनीयता के साथ तेज़ बढ़ोतरी का रुझान`,
          pa: `${trendAnalysis.confidence}% ਭਰੋਸੇ ਨਾਲ ਤੇਜ਼ ਵਧਦਾ ਰੁਝਾਨ ਲੱਭਿਆ`
        }
      });
    }

    // Seasonal insights
    if (seasonPattern && seasonPattern.highPriceMonths.includes(this.currentMonth)) {
      insights.push({
        type: 'info',
        message: {
          en: `Currently in peak price season for ${crop.name.en}`,
          hi: `${crop.name.hi} के लिए वर्तमान में चरम मूल्य का मौसम`,
          pa: `${crop.name.pa} ਲਈ ਮੌਜੂਦਾ ਸਮੇਂ ਚੋਟੀ ਦੇ ਭਾਅ ਦਾ ਮੌਸਮ ਹੈ`
        }
      });
    }

    return insights;
  }

  // Get seasonal advice
  getSeasonalAdvice(cropId, currentMonth) {
    const seasonPattern = seasonalityData.pricePatterns[cropId];
    
    if (!seasonPattern) {
      return {
        en: 'Monitor market prices regularly for best selling opportunities',
        hi: 'बेहतरीन बिक्री के अवसरों के लिए नियमित रूप से बाजार की कीमतों पर नज़र रखें',
        pa: 'ਸਭ ਤੋਂ ਵਧੀਆ ਵੇਚਣ ਦੇ ਮੌਕਿਆਂ ਲਈ ਨਿਯਮਤ ਤੌਰ \'ਤੇ ਮਾਰਕੀਟ ਦੇ ਭਾਵਾਂ \'ਤੇ ਨਜ਼ਰ ਰੱਖੋ'
      };
    }

    return seasonPattern.bestSellingAdvice;
  }

  // Calculate overall confidence score
  calculateOverallConfidence(trendAnalysis, volatility, dataPoints) {
    let confidence = 50; // Base confidence

    // Trend confidence contribution (30%)
    if (trendAnalysis.confidence) {
      confidence += (trendAnalysis.confidence - 50) * 0.3;
    }

    // Data quality contribution (25%)
    if (dataPoints >= 30) {
      confidence += 15;
    } else if (dataPoints >= 15) {
      confidence += 10;
    } else if (dataPoints >= 7) {
      confidence += 5;
    }

    // Volatility contribution (20%)
    if (volatility < 10) {
      confidence += 10;
    } else if (volatility < 20) {
      confidence += 5;
    } else if (volatility > 30) {
      confidence -= 10;
    }

    // Seasonal factor (15%)
    const crop = cropsData.crops.find(c => c.id === Object.keys(seasonalityData.pricePatterns)[0]);
    if (crop) {
      const seasonPattern = seasonalityData.pricePatterns[crop.id];
      if (seasonPattern && (seasonPattern.highPriceMonths.includes(this.currentMonth) || seasonPattern.lowPriceMonths.includes(this.currentMonth))) {
        confidence += 8;
      }
    }

    // Data source contribution (10%)
    confidence += 5; // Assuming reliable data source

    return Math.round(Math.max(30, Math.min(95, confidence)));
  }

  // Get quick market summary
  generateQuickSummary(cropId, analysis) {
    const crop = cropsData.crops.find(c => c.id === cropId);
    const recommendation = analysis.recommendation;
    
    return {
      action: recommendation.action,
      actionText: {
        en: recommendation.action === 'SELL' ? 'Sell Now' : recommendation.action === 'HOLD' ? 'Hold' : 'Wait',
        hi: recommendation.action === 'SELL' ? 'अभी बेचें' : recommendation.action === 'HOLD' ? 'रुकें' : 'इंतजार करें',
        pa: recommendation.action === 'SELL' ? 'ਹੁਣ ਵੇਚੋ' : recommendation.action === 'HOLD' ? 'ਰੁਕੋ' : 'ਇੰਤਜ਼ਾਰ ਕਰੋ'
      },
      confidence: recommendation.confidence,
      priceStatus: {
        current: analysis.current.modalPrice,
        trend: analysis.trend.trend,
        change: analysis.trend.percentChange
      },
      nextAction: this.getNextActionAdvice(cropId, recommendation.action)
    };
  }

  // Get next action advice
  getNextActionAdvice(cropId, currentAction) {
    const advice = {
      'SELL': {
        en: 'Consider selling within next 2-3 days',
        hi: 'अगले 2-3 दिनों में बेचने पर विचार करें',
        pa: 'ਅਗਲੇ 2-3 ਦਿਨਾਂ ਵਿੱਚ ਵੇਚਣ ਬਾਰੇ ਸੋਚੋ'
      },
      'HOLD': {
        en: 'Monitor prices daily, sell within 1-2 weeks',
        hi: 'रोज़ाना दामों पर नज़र रखें, 1-2 सप्ताह में बेचें',
        pa: 'ਰੋਜ਼ਾਨਾ ਭਾਵਾਂ \'ਤੇ ਨਜ਼ਰ ਰੱਖੋ, 1-2 ਹਫ਼ਤਿਆਂ ਵਿੱਚ ਵੇਚੋ'
      },
      'WAIT': {
        en: 'Wait for better market conditions',
        hi: 'बेहतर बाजारी स्थितियों का इंतजार करें',
        pa: 'ਬਿਹਤਰ ਮਾਰਕੀਟ ਹਾਲਾਤਾਂ ਦਾ ਇੰਤਜ਼ਾਰ ਕਰੋ'
      }
    };

    return advice[currentAction] || advice['WAIT'];
  }
}

export default new PredictionService();
