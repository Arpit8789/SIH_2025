// controllers/cropController.js
import Crop from '../models/Crop.js';
import MarketPrice from '../models/MarketPrice.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Helpers } from '../utils/helpers.js';
import { NotFoundError } from '../utils/errorHandler.js';

// Get all crops with filtering and pagination
export const getAllCrops = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    category,
    season,
    soilType,
    searchTerm,
    sortBy = 'name',
    order = 'asc'
  } = req.query;

  // Build filter query
  const filter = {};
  
  if (category) {
    filter.category = category;
  }
  
  if (season) {
    filter.season = season;
  }
  
  if (soilType) {
    filter.soilRequirements = { $in: [soilType] };
  }
  
  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { scientificName: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  const pagination = Helpers.paginate(page, limit);
  
  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  // Execute queries in parallel
  const [crops, totalCrops, categories, seasons] = await Promise.all([
    Crop.find(filter)
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Crop.countDocuments(filter),
    // Get available categories for filtering
    Crop.distinct('category'),
    // Get available seasons for filtering  
    Crop.distinct('season')
  ]);

  // Enrich crops with market data if user is authenticated
  let enrichedCrops = crops;
  if (req.user) {
    const cropNames = crops.map(crop => crop.name);
    const recentPrices = await MarketPrice.find({
      cropName: { $in: cropNames },
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });

    // Create price map
    const priceMap = {};
    recentPrices.forEach(price => {
      if (!priceMap[price.cropName]) {
        priceMap[price.cropName] = {
          averagePrice: price.priceData.average,
          trend: price.trend || 'stable',
          lastUpdated: price.date,
          marketName: price.market.name
        };
      }
    });

    enrichedCrops = crops.map(crop => ({
      ...crop,
      currentMarketData: priceMap[crop.name] || null
    }));
  }

  const responseData = {
    crops: enrichedCrops,
    filters: {
      availableCategories: categories,
      availableSeasons: seasons,
      appliedFilters: { category, season, soilType, searchTerm }
    }
  };

  ResponseHandler.paginated(
    res,
    responseData,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalCrops
    },
    'Crops retrieved successfully'
  );
});

// Get crop by ID with detailed information
export const getCropById = catchAsync(async (req, res, next) => {
  const { cropId } = req.params;

  const crop = await Crop.findById(cropId).lean();
  
  if (!crop) {
    throw new NotFoundError('Crop not found');
  }

  // Get market price history for this crop
  const priceHistory = await MarketPrice.find({
    cropName: crop.name,
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })
  .sort({ date: -1 })
  .limit(30)
  .lean();

  // Calculate price trends
  let priceTrend = 'stable';
  let priceChangePercent = 0;
  
  if (priceHistory.length >= 2) {
    const oldestPrice = priceHistory[priceHistory.length - 1].priceData.average;
    const latestPrice = priceHistory.priceData.average;
    priceChangePercent = ((latestPrice - oldestPrice) / oldestPrice) * 100;
    
    if (priceChangePercent > 5) priceTrend = 'rising';
    else if (priceChangePercent < -5) priceTrend = 'falling';
  }

  // Get related crops (same category)
  const relatedCrops = await Crop.find({
    category: crop.category,
    _id: { $ne: crop._id }
  })
  .limit(5)
  .select('name category season growthDuration')
  .lean();

  const enrichedCrop = {
    ...crop,
    marketAnalysis: {
      priceHistory: priceHistory.map(p => ({
        date: p.date,
        price: p.priceData.average,
        market: p.market.name,
        state: p.market.state
      })),
      currentTrend: priceTrend,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      avgPrice30Days: priceHistory.length > 0 ? 
        Math.round((priceHistory.reduce((sum, p) => sum + p.priceData.average, 0) / priceHistory.length) * 100) / 100 : null
    },
    relatedCrops,
    recommendations: generateCropRecommendations(crop, req.user)
  };

  ResponseHandler.success(res, enrichedCrop, 'Crop details retrieved successfully');
});

// Generate crop recommendations based on crop and user profile
const generateCropRecommendations = (crop, user) => {
  const recommendations = [];
  
  // General recommendations
  recommendations.push({
    type: 'general',
    title: 'Best Planting Time',
    description: `This ${crop.season} crop should be planted during the ${crop.season} season for optimal results.`
  });
  
  recommendations.push({
    type: 'soil',
    title: 'Soil Requirements',
    description: `Performs best in ${crop.soilRequirements.join(', ')} soil types.`
  });
  
  if (crop.growthDuration) {
    recommendations.push({
      type: 'timeline',
      title: 'Harvest Timeline',
      description: `Ready for harvest in approximately ${crop.growthDuration} days after planting.`
    });
  }
  
  // User-specific recommendations
  if (user && user.role === 'farmer') {
    if (user.farmingExperience < 2) {
      recommendations.push({
        type: 'beginner',
        title: 'Beginner Friendly',
        description: crop.growthDuration <= 90 ? 
          'This crop is suitable for beginner farmers due to its short growth cycle.' :
          'Consider starting with shorter duration crops if you are new to farming.'
      });
    }
    
    if (user.landSize && user.landSize <= 2) {
      recommendations.push({
        type: 'land',
        title: 'Small Land Optimization',
        description: ['vegetables', 'spices'].includes(crop.category) ?
          'Perfect for small land holdings with high yield per acre.' :
          'Consider intercropping with smaller crops to maximize land usage.'
      });
    }
  }
  
  return recommendations;
};

// Get crops by category
export const getCropsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 20, sortBy = 'name', order = 'asc' } = req.query;

  const pagination = Helpers.paginate(page, limit);
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  const [crops, totalCrops] = await Promise.all([
    Crop.find({ category })
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Crop.countDocuments({ category })
  ]);

  if (crops.length === 0) {
    throw new NotFoundError(`No crops found in category: ${category}`);
  }

  ResponseHandler.paginated(
    res,
    crops,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalCrops
    },
    `Crops in category '${category}' retrieved successfully`
  );
});

// Get crops by season
export const getCropsBySeason = catchAsync(async (req, res, next) => {
  const { season } = req.params;
  const { page = 1, limit = 20, sortBy = 'name', order = 'asc' } = req.query;

  const validSeasons = ['kharif', 'rabi', 'zaid', 'perennial'];
  if (!validSeasons.includes(season)) {
    throw new ValidationError('Invalid season', [
      { field: 'season', message: `Season must be one of: ${validSeasons.join(', ')}` }
    ]);
  }

  const pagination = Helpers.paginate(page, limit);
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  const [crops, totalCrops] = await Promise.all([
    Crop.find({ season })
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Crop.countDocuments({ season })
  ]);

  ResponseHandler.paginated(
    res,
    crops,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalCrops
    },
    `Crops for season '${season}' retrieved successfully`
  );
});

// Search crops with advanced filters
export const searchCrops = catchAsync(async (req, res, next) => {
  const {
    q: searchTerm,
    page = 1,
    limit = 20,
    category,
    season,
    minDuration,
    maxDuration,
    soilType,
    sortBy = 'relevance',
    order = 'desc'
  } = req.query;

  if (!searchTerm) {
    return ResponseHandler.validationError(res, 
      [{ field: 'q', message: 'Search term is required' }]
    );
  }

  // Build search query
  const searchQuery = {
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { scientificName: { $regex: searchTerm, $options: 'i' } },
      { commonDiseases: { $in: [new RegExp(searchTerm, 'i')] } },
      { fertilizers: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Add filters
  if (category) searchQuery.category = category;
  if (season) searchQuery.season = season;
  if (soilType) searchQuery.soilRequirements = { $in: [soilType] };
  
  if (minDuration || maxDuration) {
    searchQuery.growthDuration = {};
    if (minDuration) searchQuery.growthDuration.$gte = parseInt(minDuration);
    if (maxDuration) searchQuery.growthDuration.$lte = parseInt(maxDuration);
  }

  const pagination = Helpers.paginate(page, limit);

  // For text search, we'll use aggregation to add relevance score
  const pipeline = [
    { $match: searchQuery },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            // Name match gets highest score
            { $cond: [{ $regexMatch: { input: '$name', regex: searchTerm, options: 'i' } }, 10, 0] },
            // Scientific name match
            { $cond: [{ $regexMatch: { input: '$scientificName', regex: searchTerm, options: 'i' } }, 7, 0] },
            // Category match
            { $cond: [{ $regexMatch: { input: '$category', regex: searchTerm, options: 'i' } }, 5, 0] },
            // Common diseases match
            { $cond: [{ $in: [searchTerm, '$commonDiseases'] }, 3, 0] },
            // Random factor for diversity
            { $multiply: [{ $rand: {} }, 2] }
          ]
        }
      }
    }
  ];

  // Add sorting
  if (sortBy === 'relevance') {
    pipeline.push({ $sort: { relevanceScore: -1, name: 1 } });
  } else {
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortOptions });
  }

  // Add pagination
  pipeline.push({ $skip: pagination.skip }, { $limit: pagination.limit });

  const [searchResults, totalResults] = await Promise.all([
    Crop.aggregate(pipeline),
    Crop.countDocuments(searchQuery)
  ]);

  ResponseHandler.paginated(
    res,
    searchResults,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalResults
    },
    `Search results for '${searchTerm}' retrieved successfully`
  );
});
