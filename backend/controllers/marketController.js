// controllers/marketController.js
import MarketPrice from '../models/MarketPrice.js';
import Crop from '../models/Crop.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Helpers } from '../utils/helpers.js';

// Get current market prices with filtering
export const getCurrentPrices = catchAsync(async (req, res, next) => {
  const {
    state,
    cropName,
    page = 1,
    limit = 20,
    sortBy = 'date',
    order = 'desc'
  } = req.query;

  // Build filter for recent prices (last 7 days)
  const filter = {
    date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  };

  if (state) {
    filter['market.state'] = new RegExp(state, 'i');
  }

  if (cropName) {
    filter.cropName = new RegExp(cropName, 'i');
  }

  const pagination = Helpers.paginate(page, limit);
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Get latest price for each crop-market combination
  const currentPrices = await MarketPrice.aggregate([
    { $match: filter },
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: {
          cropName: '$cropName',
          state: '$market.state',
          district: '$market.district'
        },
        latestPrice: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestPrice' }
    },
    {
      $sort: sortOptions
    },
    {
      $skip: pagination.skip
    },
    {
      $limit: pagination.limit
    }
  ]);

  // Get total count for pagination
  const totalPrices = await MarketPrice.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          cropName: '$cropName',
          state: '$market.state',
          district: '$market.district'
        }
      }
    },
    { $count: 'total' }
  ]);

  const total = totalPrices?.total || 0;

  // Enrich with additional market insights
  const enrichedPrices = currentPrices.map(price => ({
    ...price,
    pricePerKg: Math.round((price.priceData.average / 100) * 100) / 100, // Convert to per kg if needed
    volatilityIndicator: calculateVolatility(price.priceData),
    marketStrength: calculateMarketStrength(price.priceData)
  }));

  ResponseHandler.paginated(
    res,
    enrichedPrices,
    {
      page: pagination.page,
      limit: pagination.limit,
      total
    },
    'Current market prices retrieved successfully'
  );
});

// Helper function to calculate price volatility
const calculateVolatility = (priceData) => {
  const range = priceData.maximum - priceData.minimum;
  const average = priceData.average;
  const volatilityPercent = (range / average) * 100;
  
  if (volatilityPercent > 20) return 'high';
  if (volatilityPercent > 10) return 'medium';
  return 'low';
};

// Helper function to calculate market strength
const calculateMarketStrength = (priceData) => {
  // If minimum price is close to average, indicates strong demand
  const strengthRatio = priceData.minimum / priceData.average;
  
  if (strengthRatio > 0.85) return 'strong';
  if (strengthRatio > 0.70) return 'moderate';
  return 'weak';
};

// Get price history for specific crop
export const getPriceHistory = catchAsync(async (req, res, next) => {
  const {
    cropName,
    state,
    days = 30,
    interval = 'daily'
  } = req.query;

  if (!cropName) {
    return ResponseHandler.validationError(res,
      [{ field: 'cropName', message: 'Crop name is required' }]
    );
  }

  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build match filter
  const matchFilter = {
    cropName: new RegExp(cropName, 'i'),
    date: { $gte: daysAgo }
  };

  if (state) {
    matchFilter['market.state'] = new RegExp(state, 'i');
  }

  // Group by interval (daily, weekly)
  let groupBy;
  if (interval === 'weekly') {
    groupBy = {
      year: { $year: '$date' },
      week: { $week: '$date' }
    };
  } else {
    groupBy = {
      year: { $year: '$date' },
      month: { $month: '$date' },
      day: { $dayOfMonth: '$date' }
    };
  }

  const priceHistory = await MarketPrice.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: groupBy,
        avgPrice: { $avg: '$priceData.average' },
        minPrice: { $min: '$priceData.minimum' },
        maxPrice: { $max: '$priceData.maximum' },
        marketCount: { $sum: 1 },
        date: { $first: '$date' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Calculate trend analysis
  let trend = 'stable';
  let changePercent = 0;
  
  if (priceHistory.length >= 2) {
    const firstPrice = priceHistory.avgPrice;
    const lastPrice = priceHistory[priceHistory.length - 1].avgPrice;
    changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (changePercent > 5) trend = 'rising';
    else if (changePercent < -5) trend = 'falling';
  }

  const analysis = {
    priceHistory: priceHistory.map(item => ({
      date: item.date,
      avgPrice: Math.round(item.avgPrice * 100) / 100,
      minPrice: Math.round(item.minPrice * 100) / 100,
      maxPrice: Math.round(item.maxPrice * 100) / 100,
      marketCount: item.marketCount
    })),
    summary: {
      cropName,
      timespan: `${days} days`,
      trend,
      changePercent: Math.round(changePercent * 100) / 100,
      avgPrice: priceHistory.length > 0 ? 
        Math.round((priceHistory.reduce((sum, item) => sum + item.avgPrice, 0) / priceHistory.length) * 100) / 100 : 0,
      highestPrice: priceHistory.length > 0 ? 
        Math.max(...priceHistory.map(item => item.maxPrice)) : 0,
      lowestPrice: priceHistory.length > 0 ? 
        Math.min(...priceHistory.map(item => item.minPrice)) : 0
    },
    metadata: {
      interval,
      state: state || 'All states',
      dataPoints: priceHistory.length
    }
  };

  ResponseHandler.success(res, analysis, 'Price history retrieved successfully');
});

// Get price trends across multiple crops
export const getPriceTrends = catchAsync(async (req, res, next) => {
  const {
    crops,
    state,
    days = 7
  } = req.query;

  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  // Build crop filter
  let cropFilter = {};
  if (crops) {
    const cropList = crops.split(',').map(crop => crop.trim());
    cropFilter.cropName = { $in: cropList.map(crop => new RegExp(crop, 'i')) };
  }

  // Build match filter
  const matchFilter = {
    ...cropFilter,
    date: { $gte: daysAgo }
  };

  if (state) {
    matchFilter['market.state'] = new RegExp(state, 'i');
  }

  const priceTrends = await MarketPrice.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$cropName',
        prices: {
          $push: {
            date: '$date',
            price: '$priceData.average'
          }
        },
        avgPrice: { $avg: '$priceData.average' },
        minPrice: { $min: '$priceData.minimum' },
        maxPrice: { $max: '$priceData.maximum' },
        priceCount: { $sum: 1 }
      }
    },
    {
      $addFields: {
        trend: {
          $let: {
            vars: {
              sortedPrices: {
                $sortArray: {
                  input: '$prices',
                  sortBy: { date: 1 }
                }
              }
            },
            in: {
              $cond: {
                if: { $gte: [{ $size: '$$sortedPrices' }, 2] },
                then: {
                  $let: {
                    vars: {
                      firstPrice: { $arrayElemAt: ['$$sortedPrices.price', 0] },
                      lastPrice: { $arrayElemAt: ['$$sortedPrices.price', -1] }
                    },
                    in: {
                      $cond: {
                        if: { $gt: ['$$lastPrice', { $multiply: ['$$firstPrice', 1.05] }] },
                        then: 'rising',
                        else: {
                          $cond: {
                            if: { $lt: ['$$lastPrice', { $multiply: ['$$firstPrice', 0.95] }] },
                            then: 'falling',
                            else: 'stable'
                          }
                        }
                      }
                    }
                  }
                },
                else: 'stable'
              }
            }
          }
        }
      }
    },
    { $sort: { avgPrice: -1 } }
  ]);

  const trendsData = {
    trends: priceTrends.map(trend => ({
      cropName: trend._id,
      trend: trend.trend,
      avgPrice: Math.round(trend.avgPrice * 100) / 100,
      priceRange: {
        min: Math.round(trend.minPrice * 100) / 100,
        max: Math.round(trend.maxPrice * 100) / 100
      },
      dataPoints: trend.priceCount,
      volatility: calculateVolatility({
        average: trend.avgPrice,
        minimum: trend.minPrice,
        maximum: trend.maxPrice
      })
    })),
    summary: {
      totalCrops: priceTrends.length,
      risingTrends: priceTrends.filter(t => t.trend === 'rising').length,
      fallingTrends: priceTrends.filter(t => t.trend === 'falling').length,
      stableTrends: priceTrends.filter(t => t.trend === 'stable').length,
      timespan: `${days} days`,
      state: state || 'All states'
    }
  };

  ResponseHandler.success(res, trendsData, 'Price trends retrieved successfully');
});

// Get comprehensive market analysis
export const getMarketAnalysis = catchAsync(async (req, res, next) => {
  const { state, days = 30 } = req.query;
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build match filter
  const matchFilter = { date: { $gte: daysAgo } };
  if (state) {
    matchFilter['market.state'] = new RegExp(state, 'i');
  }

  // Comprehensive market analysis
  const [
    overallStats,
    topPerformers,
    mostVolatile,
    categoryAnalysis
  ] = await Promise.all([
    // Overall market statistics
    MarketPrice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalPricePoints: { $sum: 1 },
          avgMarketPrice: { $avg: '$priceData.average' },
          uniqueCrops: { $addToSet: '$cropName' },
          uniqueMarkets: { $addToSet: '$market.name' },
          priceRange: {
            $push: '$priceData.average'
          }
        }
      }
    ]),

    // Top performing crops by price
    MarketPrice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$cropName',
          avgPrice: { $avg: '$priceData.average' },
          maxPrice: { $max: '$priceData.maximum' },
          priceCount: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } },
      { $limit: 10 }
    ]),

    // Most volatile crops
    MarketPrice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$cropName',
          avgPrice: { $avg: '$priceData.average' },
          minPrice: { $min: '$priceData.minimum' },
          maxPrice: { $max: '$priceData.maximum' },
          priceCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          volatility: {
            $divide: [
              { $subtract: ['$maxPrice', '$minPrice'] },
              '$avgPrice'
            ]
          }
        }
      },
      { $sort: { volatility: -1 } },
      { $limit: 10 }
    ]),

    // Analysis by crop category
    Crop.aggregate([
      {
        $lookup: {
          from: 'marketprices',
          let: { cropName: '$name' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$cropName', '$$cropName'] },
                    { $gte: ['$date', daysAgo] }
                  ]
                }
              }
            }
          ],
          as: 'prices'
        }
      },
      {
        $match: {
          'prices.0': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$category',
          avgPrice: { $avg: { $avg: '$prices.priceData.average' } },
          cropCount: { $sum: 1 },
          totalPricePoints: { $sum: { $size: '$prices' } }
        }
      },
      { $sort: { avgPrice: -1 } }
    ])
  ]);

  const analysis = {
    overview: {
      totalDataPoints: overallStats?.totalPricePoints || 0,
      uniqueCrops: overallStats?.uniqueCrops.length || 0,
      uniqueMarkets: overallStats?.uniqueMarkets.length || 0,
      avgMarketPrice: Math.round((overallStats?.avgMarketPrice || 0) * 100) / 100,
      timespan: `${days} days`,
      analysisDate: new Date().toISOString()
    },
    topPerformers: topPerformers.map(crop => ({
      cropName: crop._id,
      avgPrice: Math.round(crop.avgPrice * 100) / 100,
      maxPrice: Math.round(crop.maxPrice * 100) / 100,
      dataPoints: crop.priceCount
    })),
    mostVolatile: mostVolatile.map(crop => ({
      cropName: crop._id,
      avgPrice: Math.round(crop.avgPrice * 100) / 100,
      volatility: Math.round(crop.volatility * 100 * 100) / 100, // Convert to percentage
      priceRange: {
        min: Math.round(crop.minPrice * 100) / 100,
        max: Math.round(crop.maxPrice * 100) / 100
      }
    })),
    categoryAnalysis: categoryAnalysis.map(category => ({
      category: category._id,
      avgPrice: Math.round(category.avgPrice * 100) / 100,
      cropCount: category.cropCount,
      dataPoints: category.totalPricePoints
    })),
    metadata: {
      state: state || 'All states',
      currency: 'INR per quintal',
      dataSource: 'Market Price Collection',
      lastUpdated: new Date().toISOString()
    }
  };

  ResponseHandler.success(res, analysis, 'Market analysis retrieved successfully');
});
