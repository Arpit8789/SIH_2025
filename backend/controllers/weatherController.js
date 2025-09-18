// controllers/weatherController.js - ENHANCED VERSION
import openMeteoService from '../services/openMeteoService.js';
import chatAnywhereService from '../services/chatAnywhereService.js';
import WeatherAlert from '../models/WeatherAlert.js';
import WeatherAdvisory from '../models/WeatherAdvisory.js';
import Farmer from '../models/Farmer.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load crop database
let cropDatabase = null;
const loadCropDatabase = async () => {
  if (!cropDatabase) {
    try {
      const cropDataPath = path.join(__dirname, '../data/stateWiseCrops.json');
      const cropData = await fs.readFile(cropDataPath, 'utf-8');
      cropDatabase = JSON.parse(cropData);
    } catch (error) {
      console.error('Failed to load crop database:', error);
      cropDatabase = {};
    }
  }
  return cropDatabase;
};

/**
 * Get current weather with AI-powered farming advice
 */
export const getCurrentWeather = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id).select('farmLocation state district preferredLanguage actualCrops');
  
  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  // Get location coordinates
  let coordinates;
  if (farmer.farmLocation?.coordinates) {
    coordinates = farmer.farmLocation.coordinates;
  } else {
    // Get coordinates from state/district
    const locationStr = `${farmer.district || ''}, ${farmer.state || ''}`.trim();
    if (!locationStr) {
      throw new ValidationError('Location information required. Please update your profile.');
    }
    
    const locationData = await openMeteoService.getCoordinates(farmer.district, farmer.state);
    coordinates = {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };
  }

  // Get current weather from Open-Meteo
  const weatherData = await openMeteoService.getCurrentWeather(
    coordinates.latitude, 
    coordinates.longitude
  );

  // Load regional crops
  const crops = await getRegionalCrops(farmer.state, farmer.actualCrops);
  
  // Check for critical weather conditions
  const criticalConditions = openMeteoService.identifyCriticalConditions(weatherData);
  
  // Generate AI farming advice if conditions warrant it
  let aiAdvice = null;
  if (shouldGenerateAdvice(weatherData, criticalConditions)) {
    try {
      aiAdvice = await chatAnywhereService.generateFarmingAdvice(
        weatherData,
        { state: farmer.state, district: farmer.district },
        crops,
        farmer.preferredLanguage || 'en'
      );

      // Cache the advice
      await cacheWeatherAdvice(farmer._id, weatherData, aiAdvice);
    } catch (error) {
      console.warn('AI advice generation failed, using fallback:', error.message);
    }
  }

  // Create alerts if needed
  await createWeatherAlertsIfNeeded(farmer._id, weatherData, criticalConditions, crops);

  const response = {
    success: true,
    data: {
      current: {
        temperature: weatherData.temperature,
        feelsLike: weatherData.apparentTemperature,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation,
        condition: {
          main: weatherData.weatherCondition,
          description: weatherData.weatherDescription,
          code: weatherData.weatherCode
        },
        wind: {
          speed: weatherData.windSpeed,
          direction: weatherData.windDirection,
          gusts: weatherData.windGusts
        },
        pressure: weatherData.pressure,
        cloudCover: weatherData.cloudCover,
        uvIndex: weatherData.uvIndex,
        visibility: weatherData.visibility,
        isDay: weatherData.isDay
      },
      location: {
        name: `${farmer.district}, ${farmer.state}`,
        state: farmer.state,
        district: farmer.district,
        coordinates: coordinates
      },
      lastUpdated: weatherData.timestamp,
      
      // Agricultural insights
      agriculturalInfo: aiAdvice ? [
        {
          type: 'ai_advice',
          priority: 'high',
          message: aiAdvice.primaryAdvice,
          additionalTips: aiAdvice.additionalTips,
          source: aiAdvice.source
        }
      ] : await getFallbackAgriculturalInfo(weatherData, crops),
      
      // Regional crop information
      regionalCrops: crops.map(crop => ({
        name: crop.name,
        localName: crop.local_name,
        hindiName: crop.hindi_name,
        currentSeason: getCurrentSeason(),
        waterRequirement: crop.water_requirement
      })),
      
      // Critical conditions flags
      criticalConditions: criticalConditions
    }
  };

  ResponseHandler.success(res, response, 'Current weather data retrieved successfully');
});

/**
 * Get weather forecast with agricultural insights
 */
export const getWeatherForecast = catchAsync(async (req, res, next) => {
  const { days = 7 } = req.query;
  const farmer = await Farmer.findById(req.user._id).select('farmLocation state district preferredLanguage actualCrops');
  
  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  // Get coordinates
  let coordinates;
  if (farmer.farmLocation?.coordinates) {
    coordinates = farmer.farmLocation.coordinates;
  } else {
    const locationData = await openMeteoService.getCoordinates(farmer.district, farmer.state);
    coordinates = {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };
  }

  // Get forecast from Open-Meteo
  const forecastData = await openMeteoService.getWeatherForecast(
    coordinates.latitude,
    coordinates.longitude,
    parseInt(days)
  );

  // Load regional crops
  const crops = await getRegionalCrops(farmer.state, farmer.actualCrops);

  // Add agricultural insights to each day
  const enhancedForecast = await Promise.all(
    forecastData.forecast.map(async (day) => {
      const agriculturalData = await generateDailyAgriculturalInsights(day, crops);
      
      return {
        ...day,
        agriculturalData: agriculturalData
      };
    })
  );

  const response = {
    success: true,
    data: {
      location: {
        name: `${farmer.district}, ${farmer.state}`,
        coordinates: coordinates
      },
      forecast: enhancedForecast,
      generatedAt: forecastData.generatedAt,
      
      // Weekly summary
      weeklyInsights: {
        rainDays: enhancedForecast.filter(day => day.precipitation.total > 2).length,
        clearDays: enhancedForecast.filter(day => day.weatherCondition === 'clear').length,
        avgTemperature: Math.round(
          enhancedForecast.reduce((sum, day) => sum + day.temperature.average, 0) / enhancedForecast.length
        ),
        totalRainfall: enhancedForecast.reduce((sum, day) => sum + day.precipitation.total, 0),
        irrigationDays: enhancedForecast.filter(day => day.agriculturalData?.irrigation).length,
        sprayingDays: enhancedForecast.filter(day => day.agriculturalData?.sprayingRecommended).length
      }
    }
  };

  ResponseHandler.success(res, response, 'Weather forecast retrieved successfully');
});

/**
 * Get weather alerts for farmer
 */
export const getWeatherAlerts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const farmer = await Farmer.findById(req.user._id);

  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  // Build query
  const query = { farmerId: farmer._id };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  // Get alerts with pagination
  const alerts = await WeatherAlert.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Get total count
  const totalAlerts = await WeatherAlert.countDocuments(query);
  const unreadCount = await WeatherAlert.countDocuments({ 
    farmerId: farmer._id, 
    isRead: false 
  });

  const response = {
    success: true,
    data: {
      alerts: alerts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAlerts / limit),
        totalItems: totalAlerts,
        itemsPerPage: parseInt(limit)
      },
      summary: {
        total: totalAlerts,
        unread: unreadCount,
        categories: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length
        }
      }
    }
  };

  ResponseHandler.success(res, response, 'Weather alerts retrieved successfully');
});

/**
 * Mark weather alerts as read
 */
export const markAlertsAsRead = catchAsync(async (req, res, next) => {
  const { alertIds } = req.body;
  const farmer = await Farmer.findById(req.user._id);

  if (!farmer) {
    throw new NotFoundError('Farmer profile not found');
  }

  let query = { farmerId: farmer._id };
  
  if (alertIds && Array.isArray(alertIds) && alertIds.length > 0) {
    query._id = { $in: alertIds };
  }

  const result = await WeatherAlert.updateMany(query, { 
    isRead: true,
    readAt: new Date()
  });

  ResponseHandler.success(res, {
    success: true,
    data: {
      modifiedCount: result.modifiedCount
    }
  }, `${result.modifiedCount} alerts marked as read`);
});

/**
 * Test AI service connection
 */
export const testAIConnection = catchAsync(async (req, res, next) => {
  const result = await chatAnywhereService.testConnection();
  
  ResponseHandler.success(res, {
    success: true,
    data: result
  }, 'AI service test completed');
});

// Helper Functions

/**
 * Get regional crops for a state
 */
async function getRegionalCrops(state, actualCrops = []) {
  const crops = await loadCropDatabase();
  const stateKey = state?.replace(/\s+/g, '_');
  const currentSeason = getCurrentSeason();
  
  if (!crops[stateKey]) {
    return []; // Return empty if state not found
  }

  // If farmer has specified actual crops, use those
  if (actualCrops && actualCrops.length > 0) {
    const stateCrops = crops[stateKey][currentSeason]?.crops || [];
    return stateCrops.filter(crop => 
      actualCrops.some(actualCrop => 
        actualCrop.toLowerCase().includes(crop.name.toLowerCase()) ||
        crop.name.toLowerCase().includes(actualCrop.toLowerCase())
      )
    );
  }

  // Otherwise return top 3 crops for current season
  const seasonCrops = crops[stateKey][currentSeason]?.crops || [];
  return seasonCrops.slice(0, 3);
}

/**
 * Determine current agricultural season
 */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 6 && month <= 11) return 'kharif';
  if (month >= 12 || month <= 3) return 'rabi';
  return 'zaid'; // April-May
}

/**
 * Check if AI advice should be generated
 */
function shouldGenerateAdvice(weatherData, criticalConditions) {
  // Generate advice for critical conditions
  if (Object.values(criticalConditions).some(condition => condition)) {
    return true;
  }
  
  // Generate advice for significant weather changes
  if (weatherData.precipitation > 5 || 
      weatherData.temperature > 35 || 
      weatherData.temperature < 10 ||
      weatherData.windSpeed > 15) {
    return true;
  }
  
  return false;
}

/**
 * Cache weather advice to avoid repeated API calls
 */
async function cacheWeatherAdvice(farmerId, weatherData, advice) {
  try {
    await WeatherAdvisory.findOneAndUpdate(
      { 
        farmerId: farmerId,
        date: new Date().toISOString().split('T')[0] // Today's date
      },
      {
        farmerId: farmerId,
        date: new Date().toISOString().split('T')[0],
        weatherConditions: {
          temperature: weatherData.temperature,
          precipitation: weatherData.precipitation,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          condition: weatherData.weatherCondition
        },
        advice: advice,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valid for 24 hours
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to cache weather advice:', error);
  }
}

/**
 * Create weather alerts if critical conditions detected
 */
async function createWeatherAlertsIfNeeded(farmerId, weatherData, criticalConditions, crops) {
  const alerts = [];
  const location = {
    coordinates: weatherData.coordinates
  };

  // Heavy rain alert
  if (criticalConditions.heavyRain) {
    alerts.push({
      farmerId: farmerId,
      alertType: 'heavy_rain',
      severity: 'high',
      message: 'Heavy rainfall expected. Avoid field operations and ensure proper drainage.',
      recommendations: [
        'Postpone pesticide and fertilizer application',
        'Ensure proper field drainage',
        'Secure farm equipment',
        'Monitor crop health post-rain'
      ],
      location: location,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }

  // Strong winds alert
  if (criticalConditions.strongWinds) {
    alerts.push({
      farmerId: farmerId,
      alertType: 'strong_winds',
      severity: 'medium',
      message: 'Strong winds expected. Secure crops and avoid spraying operations.',
      recommendations: [
        'Provide support to tall crops',
        'Avoid pesticide spraying',
        'Secure farm structures',
        'Monitor for crop damage'
      ],
      location: location,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000)
    });
  }

  // Extreme temperature alert
  if (criticalConditions.extremeTemperature) {
    const isHot = weatherData.temperature > 35;
    alerts.push({
      farmerId: farmerId,
      alertType: isHot ? 'heat_wave' : 'cold_wave',
      severity: 'high',
      message: isHot ? 
        'Extreme heat expected. Increase irrigation and provide crop protection.' :
        'Cold weather alert. Protect crops from frost damage.',
      recommendations: isHot ? [
        'Increase irrigation frequency',
        'Provide shade to sensitive crops',
        'Avoid midday field work',
        'Monitor crop stress signs'
      ] : [
        'Cover sensitive crops',
        'Use water spray for frost protection',
        'Harvest mature crops if possible',
        'Monitor for frost damage'
      ],
      location: location,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }

  // Save all alerts
  if (alerts.length > 0) {
    try {
      await WeatherAlert.insertMany(alerts);
    } catch (error) {
      console.error('Failed to create weather alerts:', error);
    }
  }
}

/**
 * Generate daily agricultural insights
 */
async function generateDailyAgriculturalInsights(dayWeather, crops) {
  const insights = {
    irrigation: false,
    sprayingRecommended: false,
    fieldWorkSuitable: true,
    cropRisk: 'low',
    recommendations: []
  };

  // Irrigation recommendation
  if (dayWeather.precipitation.total < 2 && dayWeather.temperature.max > 30) {
    insights.irrigation = true;
    insights.recommendations.push('Consider irrigation due to low rainfall and high temperature');
  }

  // Spraying conditions
  if (dayWeather.precipitation.total < 1 && dayWeather.wind.speed < 15) {
    insights.sprayingRecommended = true;
    insights.recommendations.push('Good conditions for pesticide/fertilizer application');
  }

  // Field work suitability
  if (dayWeather.precipitation.total > 10 || dayWeather.wind.speed > 25) {
    insights.fieldWorkSuitable = false;
    insights.recommendations.push('Avoid field operations due to weather conditions');
  }

  // Crop risk assessment
  if (dayWeather.precipitation.total > 25 || dayWeather.temperature.max > 40) {
    insights.cropRisk = 'high';
  } else if (dayWeather.precipitation.total > 10 || dayWeather.temperature.max > 35) {
    insights.cropRisk = 'medium';
  }

  return insights;
}

/**
 * Get fallback agricultural information when AI is not available
 */
async function getFallbackAgriculturalInfo(weatherData, crops) {
  const info = [];

  if (weatherData.precipitation > 2) {
    info.push({
      type: 'rain_advisory',
      priority: 'medium',
      message: 'Rain detected. Postpone pesticide application and ensure proper drainage.',
      source: 'system'
    });
  }

  if (weatherData.temperature > 35) {
    info.push({
      type: 'heat_advisory', 
      priority: 'high',
      message: 'High temperature. Increase irrigation frequency and provide shade to crops.',
      source: 'system'
    });
  }

  if (weatherData.windSpeed > 20) {
    info.push({
      type: 'wind_advisory',
      priority: 'medium', 
      message: 'Strong winds expected. Secure tall crops and avoid spraying operations.',
      source: 'system'
    });
  }

  if (info.length === 0) {
    info.push({
      type: 'general_advisory',
      priority: 'low',
      message: 'Monitor your crops regularly and follow standard farming practices.',
      source: 'system'
    });
  }

  return info;
}
