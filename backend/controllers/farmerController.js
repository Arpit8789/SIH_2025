// controllers/farmerController.js
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Crop from '../models/Crop.js';
import WeatherAlert from '../models/WeatherAlert.js';
import MarketPrice from '../models/MarketPrice.js';
import DiseaseDetection from '../models/DiseaseDetection.js';
import GovernmentScheme from '../models/GovernmentScheme.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { Validators } from '../utils/validators.js';
import { Helpers } from '../utils/helpers.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';
import axios from 'axios';
import config from '../config/config.js';

// Get farmer profile with complete information
export const getFarmerProfile = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id)
    .select('-password')
    .lean();

  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  // Get additional statistics
  const [diseaseDetections, totalSchemes, recentAlerts] = await Promise.all([
    DiseaseDetection.countDocuments({ farmerId: farmer._id }),
    farmer.governmentSchemes?.length || 0,
    WeatherAlert.countDocuments({ 
      farmerId: farmer._id, 
      isRead: false,
      validUntil: { $gte: new Date() }
    })
  ]);

  const enrichedProfile = {
    ...farmer,
    statistics: {
      totalDiseaseDetections: diseaseDetections,
      appliedSchemes: totalSchemes,
      unreadAlerts: recentAlerts,
      accountAge: Math.floor((new Date() - new Date(farmer.createdAt)) / (1000 * 60 * 60 * 24))
    }
  };

  ResponseHandler.success(res, enrichedProfile, 'Farmer profile retrieved successfully');
});

// Update farmer profile
export const updateFarmerProfile = catchAsync(async (req, res, next) => {
  const {
    name,
    phone,
    farmLocation,
    landSize,
    currentCrops,
    soilType,
    farmingExperience,
    preferredLanguage,
    farmingType,
    irrigationSystem
  } = req.body;

  // Validate required fields
  const validation = Validators.validateFields(req.body, {
    name: { type: 'name', fieldName: 'Name' },
    phone: { type: 'phone' },
    landSize: { type: 'landSize' }
  });

  if (!validation.isValid) {
    throw new ValidationError('Profile validation failed', validation.errors);
  }

  // Validate coordinates if provided
  if (farmLocation?.coordinates) {
    const coordValidation = Validators.validateCoordinates(
      farmLocation.coordinates.latitude,
      farmLocation.coordinates.longitude
    );
    if (!coordValidation.isValid) {
      throw new ValidationError('Invalid coordinates', [
        { field: 'coordinates', message: coordValidation.message }
      ]);
    }
  }

  // Validate pincode if provided
  if (farmLocation?.pincode) {
    const pincodeValidation = Validators.validatePincode(farmLocation.pincode);
    if (!pincodeValidation.isValid) {
      throw new ValidationError('Invalid pincode', [
        { field: 'pincode', message: pincodeValidation.message }
      ]);
    }
  }

  // Prepare update data
  const updateData = {
    name: name?.trim(),
    phone: phone?.trim(),
    landSize: parseFloat(landSize),
    farmingExperience: farmingExperience ? parseInt(farmingExperience) : undefined,
    preferredLanguage,
    farmingType,
    irrigationSystem
  };

  // Handle farm location
  if (farmLocation) {
    updateData.farmLocation = {
      state: farmLocation.state?.trim(),
      district: farmLocation.district?.trim(),
      village: farmLocation.village?.trim(),
      pincode: farmLocation.pincode?.trim(),
      coordinates: farmLocation.coordinates
    };
  }

  // Handle current crops
  if (currentCrops && Array.isArray(currentCrops)) {
    updateData.currentCrops = currentCrops.map(crop => crop.trim()).filter(Boolean);
  }

  // Handle profile image upload
  if (req.uploadedFile) {
    updateData.profileImage = `/uploads/profiles/${req.uploadedFile.filename}`;
  }

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const updatedFarmer = await Farmer.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  ResponseHandler.success(res, updatedFarmer, 'Profile updated successfully');
});

// Get crop recommendations based on farmer's conditions
export const getCropRecommendations = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  
  if (!farmer || !farmer.farmLocation?.state) {
    throw new ValidationError('Farm location is required for recommendations', [
      { field: 'farmLocation', message: 'Please update your farm location in profile' }
    ]);
  }

  const { season, customSoilType, customClimate } = req.query;
  
  // Build recommendation query based on farmer's profile
  const recommendationQuery = {
    $or: []
  };

  // Soil type matching
  if (farmer.soilType || customSoilType) {
    recommendationQuery.$or.push({
      soilRequirements: { $in: [farmer.soilType || customSoilType] }
    });
  }

  // Season filtering
  if (season) {
    recommendationQuery.season = season;
  } else {
    // Default to current season based on month
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason;
    if (currentMonth >= 6 && currentMonth <= 9) {
      currentSeason = 'kharif';
    } else if (currentMonth >= 10 || currentMonth <= 3) {
      currentSeason = 'rabi';
    } else {
      currentSeason = 'zaid';
    }
    recommendationQuery.season = { $in: [currentSeason, 'perennial'] };
  }

  // Get weather data for better recommendations
  let weatherData = null;
  if (farmer.farmLocation.coordinates && config.weatherApiKey) {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${farmer.farmLocation.coordinates.latitude}&lon=${farmer.farmLocation.coordinates.longitude}&appid=${config.weatherApiKey}&units=metric`
      );
      weatherData = weatherResponse.data;
    } catch (error) {
      console.warn('Weather API call failed:', error.message);
    }
  }

  // Get crop recommendations
  const recommendedCrops = await Crop.aggregate([
    { $match: recommendationQuery },
    {
      $addFields: {
        // Calculate suitability score based on various factors
        suitabilityScore: {
          $add: [
            // Soil match score
            {
              $cond: [
                { $in: [farmer.soilType, '$soilRequirements'] },
                30,
                0
              ]
            },
            // Market price trend score
            {
              $cond: [
                { $eq: ['$marketPrice.trend', 'rising'] },
                25,
                { $cond: [{ $eq: ['$marketPrice.trend', 'stable'] }, 15, 5] }
              ]
            },
            // Growth duration preference (shorter = better for new farmers)
            {
              $cond: [
                { $lt: ['$growthDuration', 90] },
                20,
                { $cond: [{ $lt: ['$growthDuration', 120] }, 10, 5] }
              ]
            },
            // Random factor for diversity
            { $multiply: [{ $rand: {} }, 25] }
          ]
        }
      }
    },
    { $sort: { suitabilityScore: -1 } },
    { $limit: 10 }
  ]);

  // Get current market prices for recommended crops
  const cropNames = recommendedCrops.map(crop => crop.name);
  const marketPrices = await MarketPrice.find({
    cropName: { $in: cropNames },
    'market.state': farmer.farmLocation.state,
    date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  }).sort({ date: -1 });

  // Enrich recommendations with market data
  const enrichedRecommendations = recommendedCrops.map(crop => {
    const recentPrice = marketPrices.find(p => p.cropName === crop.name);
    
    return {
      ...crop,
      marketData: recentPrice ? {
        currentPrice: recentPrice.priceData.average,
        priceRange: {
          min: recentPrice.priceData.minimum,
          max: recentPrice.priceData.maximum
        },
        trend: crop.marketPrice?.trend || 'stable',
        lastUpdated: recentPrice.date
      } : null,
      weatherSuitability: weatherData ? calculateWeatherSuitability(crop, weatherData) : null,
      recommendationReasons: generateRecommendationReasons(crop, farmer, recentPrice)
    };
  });

  const responseData = {
    recommendations: enrichedRecommendations,
    farmerProfile: {
      state: farmer.farmLocation.state,
      district: farmer.farmLocation.district,
      soilType: farmer.soilType,
      landSize: farmer.landSize,
      experience: farmer.farmingExperience
    },
    currentWeather: weatherData ? {
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      description: weatherData.weather.description
    } : null,
    generatedAt: new Date().toISOString()
  };

  ResponseHandler.success(res, responseData, 'Crop recommendations generated successfully');
});

// Helper function to calculate weather suitability
const calculateWeatherSuitability = (crop, weatherData) => {
  let score = 50; // Base score
  
  if (crop.climateRequirements) {
    const { temperature, humidity } = weatherData.main;
    
    // Temperature suitability
    if (crop.climateRequirements.temperature) {
      const { min, max } = crop.climateRequirements.temperature;
      if (temperature >= min && temperature <= max) {
        score += 25;
      } else if (Math.abs(temperature - (min + max) / 2) < 5) {
        score += 10;
      }
    }
    
    // Humidity suitability
    if (crop.climateRequirements.humidity) {
      const { min, max } = crop.climateRequirements.humidity;
      if (humidity >= min && humidity <= max) {
        score += 25;
      } else if (Math.abs(humidity - (min + max) / 2) < 10) {
        score += 10;
      }
    }
  }
  
  return Math.min(100, Math.max(0, score));
};

// Generate recommendation reasons
const generateRecommendationReasons = (crop, farmer, priceData) => {
  const reasons = [];
  
  if (farmer.soilType && crop.soilRequirements.includes(farmer.soilType)) {
    reasons.push(`Suitable for ${farmer.soilType} soil type`);
  }
  
  if (crop.growthDuration <= 90) {
    reasons.push('Quick harvest cycle - good for cash flow');
  }
  
  if (priceData && priceData.priceData.average > 2000) {
    reasons.push('Good market price currently');
  }
  
  if (crop.marketPrice?.trend === 'rising') {
    reasons.push('Price trend is favorable');
  }
  
  if (farmer.farmingExperience < 2 && crop.category === 'vegetables') {
    reasons.push('Suitable for beginner farmers');
  }
  
  if (farmer.landSize <= 2 && ['vegetables', 'spices'].includes(crop.category)) {
    reasons.push('Good for small land holdings');
  }
  
  return reasons;
};

// Get weather alerts for farmer
export const getWeatherAlerts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, severity } = req.query;
  
  // Build filter
  const filter = {
    farmerId: req.user._id,
    validUntil: { $gte: new Date() }
  };
  
  if (severity) {
    filter.severity = severity;
  }
  
  const pagination = Helpers.paginate(page, limit);
  
  const [alerts, totalAlerts] = await Promise.all([
    WeatherAlert.find(filter)
      .sort({ createdAt: -1, severity: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    WeatherAlert.countDocuments(filter)
  ]);

  // Mark alerts as read
  await WeatherAlert.updateMany(
    { farmerId: req.user._id, isRead: false },
    { isRead: true }
  );

  ResponseHandler.paginated(
    res,
    alerts,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalAlerts
    },
    'Weather alerts retrieved successfully'
  );
});

// Get current market prices for farmer's region
export const getMarketPrices = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  
  if (!farmer || !farmer.farmLocation?.state) {
    throw new ValidationError('Farm location required', [
      { field: 'farmLocation', message: 'Please update your farm location' }
    ]);
  }

  const { cropName, days = 7 } = req.query;
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build query
  const query = {
    'market.state': farmer.farmLocation.state,
    date: { $gte: daysAgo }
  };

  if (cropName) {
    query.cropName = new RegExp(cropName, 'i');
  }

  const marketPrices = await MarketPrice.find(query)
    .sort({ date: -1 })
    .limit(100)
    .lean();

  // Group prices by crop for better analysis
  const priceAnalysis = {};
  marketPrices.forEach(price => {
    if (!priceAnalysis[price.cropName]) {
      priceAnalysis[price.cropName] = {
        cropName: price.cropName,
        currentPrice: price.priceData.average,
        priceHistory: [],
        trend: 'stable',
        priceRange: {
          min: price.priceData.minimum,
          max: price.priceData.maximum
        }
      };
    }
    
    priceAnalysis[price.cropName].priceHistory.push({
      date: price.date,
      price: price.priceData.average,
      market: price.market.name
    });
  });

  // Calculate trends
  Object.keys(priceAnalysis).forEach(cropName => {
    const prices = priceAnalysis[cropName].priceHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (prices.length >= 2) {
      const firstPrice = prices.price;
      const lastPrice = prices[prices.length - 1].price;
      const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      if (changePercent > 5) {
        priceAnalysis[cropName].trend = 'rising';
      } else if (changePercent < -5) {
        priceAnalysis[cropName].trend = 'falling';
      }
      
      priceAnalysis[cropName].changePercent = Math.round(changePercent * 100) / 100;
    }
  });

  const responseData = {
    location: {
      state: farmer.farmLocation.state,
      district: farmer.farmLocation.district
    },
    priceAnalysis: Object.values(priceAnalysis),
    lastUpdated: marketPrices.length > 0 ? marketPrices.date : null,
    dataRange: `${days} days`
  };

  ResponseHandler.success(res, responseData, 'Market prices retrieved successfully');
});

// Get farmer's disease detection history
export const getDiseaseHistory = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, cropName } = req.query;
  
  // Build filter
  const filter = { farmerId: req.user._id };
  if (status) filter.status = status;
  if (cropName) filter.cropName = new RegExp(cropName, 'i');
  
  const pagination = Helpers.paginate(page, limit);
  
  const [detections, totalDetections] = await Promise.all([
    DiseaseDetection.find(filter)
      .sort({ detectionDate: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    DiseaseDetection.countDocuments(filter)
  ]);

  // Add statistics
  const stats = await DiseaseDetection.aggregate([
    { $match: { farmerId: req.user._id } },
    {
      $group: {
        _id: null,
        totalDetections: { $sum: 1 },
        resolvedCases: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        avgConfidence: { $avg: '$detectionResults.confidence' },
        commonDiseases: { $push: '$detectionResults.diseaseName' }
      }
    }
  ]);

  const responseData = {
    detections,
    statistics: stats || {
      totalDetections: 0,
      resolvedCases: 0,
      avgConfidence: 0,
      commonDiseases: []
    },
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: totalDetections
    }
  };

  ResponseHandler.paginated(
    res,
    responseData.detections,
    responseData.pagination,
    'Disease detection history retrieved successfully'
  );
});

// Get available government schemes for farmer
export const getGovernmentSchemes = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  
  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  const { category, page = 1, limit = 20 } = req.query;
  
  // Build eligibility filter
  const eligibilityFilter = {
    isActive: true,
    'timeline.isOngoing': true,
    $or: [
      { 'eligibility.states': { $in: [farmer.farmLocation?.state] } },
      { 'eligibility.states': { $size: 0 } } // Schemes available in all states
    ]
  };

  // Land size filter
  if (farmer.landSize) {
    eligibilityFilter.$and = [
      {
        $or: [
          { 'eligibility.landSize.min': { $exists: false } },
          { 'eligibility.landSize.min': { $lte: farmer.landSize } }
        ]
      },
      {
        $or: [
          { 'eligibility.landSize.max': { $exists: false } },
          { 'eligibility.landSize.max': { $gte: farmer.landSize } }
        ]
      }
    ];
  }

  // Category filter
  if (category) {
    eligibilityFilter.category = category;
  }

  const pagination = Helpers.paginate(page, limit);

  const [schemes, totalSchemes] = await Promise.all([
    GovernmentScheme.find(eligibilityFilter)
      .sort({ 'popularity.rating': -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    GovernmentScheme.countDocuments(eligibilityFilter)
  ]);

  // Check which schemes farmer has already applied for
  const appliedSchemeIds = farmer.governmentSchemes?.map(scheme => scheme.schemeId) || [];
  
  const enrichedSchemes = schemes.map(scheme => ({
    ...scheme,
    hasApplied: appliedSchemeIds.includes(scheme.schemeCode),
    applicationStatus: farmer.governmentSchemes?.find(
      applied => applied.schemeId === scheme.schemeCode
    )?.status || null
  }));

  ResponseHandler.paginated(
    res,
    enrichedSchemes,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: totalSchemes
    },
    'Government schemes retrieved successfully'
  );
});

// Apply for government scheme
export const applyForScheme = catchAsync(async (req, res, next) => {
  const { schemeId } = req.params;
  const { documents } = req.body; // Array of document URLs/paths
  
  // Find the scheme
  const scheme = await GovernmentScheme.findById(schemeId);
  if (!scheme) {
    throw new NotFoundError('Government scheme not found');
  }

  // Check if farmer already applied
  const farmer = await Farmer.findById(req.user._id);
  const existingApplication = farmer.governmentSchemes?.find(
    applied => applied.schemeId === scheme.schemeCode
  );

  if (existingApplication) {
    return ResponseHandler.error(res, 'You have already applied for this scheme', 400);
  }

  // Add application to farmer's record
  const applicationData = {
    schemeName: scheme.schemeName,
    schemeId: scheme.schemeCode,
    appliedDate: new Date(),
    status: 'applied',
    documents: documents || []
  };

  await Farmer.findByIdAndUpdate(
    req.user._id,
    { 
      $push: { governmentSchemes: applicationData },
      $inc: { 'popularity.totalApplications': 1 }
    }
  );

  // Update scheme popularity
  await GovernmentScheme.findByIdAndUpdate(
    schemeId,
    { $inc: { 'popularity.totalApplications': 1 } }
  );

  ResponseHandler.created(res, applicationData, 'Application submitted successfully');
});
