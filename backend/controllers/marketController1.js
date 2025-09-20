// backend/controllers/marketController.js - ES MODULE VERSION
import agmarknetService from '../services/agmarknetService.js'; // ✅ .js extension required

class MarketController {
  // ✅ Get REAL-TIME prices
  async getRealTimePrices(req, res) {
    try {
      const { commodity, state, market = '' } = req.query;

      if (!commodity || !state) {
        return res.status(400).json({
          success: false,
          error: 'Commodity and state are required'
        });
      }

      console.log(`🌾 Fetching REAL-TIME data for: ${commodity} | State: ${state} | Market: ${market || 'ALL'}`);

      // Fetch live prices from service
      const realData = await agmarknetService.fetchRealPrices(commodity, state, market);

      if (!realData || realData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No real-time market data found'
        });
      }

      return res.status(200).json({
        success: true,
        data: realData,
        timestamp: new Date().toISOString(),
        source: 'agmarknet.gov.in',
        type: 'real_time'
      });

    } catch (error) {
      console.error('❌ Real-time data fetch failed:', error.message);
      return res.status(503).json({
        success: false,
        error: 'Real market data unavailable',
        message: 'Could not fetch live data from Agmarknet',
        details: error.message
      });
    }
  }

  // ✅ Get REAL HISTORICAL prices
  async getRealHistoricalData(req, res) {
    try {
      const { commodity, state, days = 30 } = req.query;

      if (!commodity || !state) {
        return res.status(400).json({
          success: false,
          error: 'Commodity and state are required'
        });
      }

      const daysInt = parseInt(days, 10) || 30;

      console.log(`📊 Fetching REAL HISTORICAL data for: ${commodity} | State: ${state} | Last ${daysInt} days`);

      // Fetch historical data
      const realHistory = await agmarknetService.fetchRealHistoricalData(commodity, state, daysInt);

      if (!realHistory || realHistory.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No historical data found'
        });
      }

      return res.status(200).json({
        success: true,
        data: realHistory,
        timestamp: new Date().toISOString(),
        source: 'government_records',
        type: 'historical_real'
      });

    } catch (error) {
      console.error('❌ Historical data fetch failed:', error.message);
      return res.status(503).json({
        success: false,
        error: 'Real historical data unavailable',
        message: 'Could not fetch historical records',
        details: error.message
      });
    }
  }
}

export default new MarketController(); // ✅ ES Module export
