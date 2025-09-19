// backend/controllers/marketController.js - ES MODULE VERSION
import agmarknetService from '../services/agmarknetService.js'; // Note: .js extension

class MarketController {
  
  async getRealTimePrices(req, res) {
    try {
      const { commodity, state, market } = req.query;
      
      if (!commodity || !state) {
        return res.status(400).json({
          success: false,
          error: 'Commodity and state are required'
        });
      }

      console.log(`🌾 Fetching REAL data: ${commodity} in ${state}`);
      
      // ONLY REAL DATA - throws error if can't fetch real data
      const realData = await agmarknetService.fetchRealPrices(commodity, state, market);
      
      if (!realData) {
        throw new Error('Could not fetch real market data');
      }
      
      res.json({
        success: true,
        data: realData,
        timestamp: new Date().toISOString(),
        source: 'agmarknet.gov.in',
        type: 'real_time'
      });
      
    } catch (error) {
      console.error('❌ Real data fetch failed:', error);
      res.status(503).json({
        success: false,
        error: 'Real market data unavailable',
        message: 'Could not fetch live data from agmarknet',
        details: error.message
      });
    }
  }

  async getRealHistoricalData(req, res) {
    try {
      const { commodity, state, days = 30 } = req.query;
      
      if (!commodity || !state) {
        return res.status(400).json({
          success: false,
          error: 'Commodity and state are required'
        });
      }

      console.log(`📊 Fetching REAL history: ${commodity} in ${state}`);
      
      // ONLY REAL HISTORICAL DATA
      const realHistory = await agmarknetService.fetchRealHistoricalData(commodity, state, parseInt(days));
      
      if (!realHistory || realHistory.length === 0) {
        throw new Error('Could not fetch real historical data');
      }
      
      res.json({
        success: true,
        data: realHistory,
        timestamp: new Date().toISOString(),
        source: 'government_records',
        type: 'historical_real'
      });
      
    } catch (error) {
      console.error('❌ Real historical data fetch failed:', error);
      res.status(503).json({
        success: false,
        error: 'Real historical data unavailable',
        message: 'Could not fetch historical records',
        details: error.message
      });
    }
  }
}

export default new MarketController(); // ⭐ CHANGED: ES Module export
