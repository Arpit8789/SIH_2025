// backend/services/weatherAlertService.js - BACKGROUND SERVICE
import cron from 'node-cron';
import openMeteoService from './openMeteoService.js';
import chatAnywhereService from './chatAnywhereService.js';
import cropMappingService from './cropMappingService.js';
import WeatherAlert from '../models/WeatherAlert.js';
import WeatherAdvisory from '../models/WeatherAdvisory.js';
import Farmer from '../models/Farmer.js';
import { sendNotification } from '../utils/notificationService.js';

class WeatherAlertService {
  constructor() {
    this.isRunning = false;
    this.cronJobs = [];
    this.alertThresholds = {
      heavyRain: 25, // mm per day
      extremeHeat: 40, // °C
      extremeCold: 5, // °C
      strongWinds: 25, // km/h
      frost: 4, // °C with high humidity
      hail: [96, 99] // Weather codes for thunderstorm with hail
    };
  }

  /**
   * Start background weather monitoring
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Weather alert service is already running');
      return;
    }

    console.log('🚀 Starting Weather Alert Service...');

    // Check weather every 30 minutes
    const weatherCheckJob = cron.schedule('*/30 * * * *', async () => {
      await this.checkAllFarmersWeather();
    }, { scheduled: false });

    // Generate daily advisories at 6 AM
    const dailyAdvisoryJob = cron.schedule('0 6 * * *', async () => {
      await this.generateDailyAdvisories();
    }, { scheduled: false });

    // Clean up old alerts at midnight
    const cleanupJob = cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldAlerts();
    }, { scheduled: false });

    // Start all jobs
    weatherCheckJob.start();
    dailyAdvisoryJob.start();
    cleanupJob.start();

    this.cronJobs = [weatherCheckJob, dailyAdvisoryJob, cleanupJob];
    this.isRunning = true;

    console.log('✅ Weather Alert Service started successfully');
    console.log('📅 Schedule:');
    console.log('   - Weather checks: Every 30 minutes');
    console.log('   - Daily advisories: 6:00 AM');
    console.log('   - Cleanup: Midnight');
  }

  /**
   * Stop background service
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Weather alert service is not running');
      return;
    }

    console.log('🛑 Stopping Weather Alert Service...');

    this.cronJobs.forEach(job => {
      job.stop();
      job.destroy();
    });

    this.cronJobs = [];
    this.isRunning = false;

    console.log('✅ Weather Alert Service stopped');
  }

  /**
   * Check weather for all active farmers
   */
  async checkAllFarmersWeather() {
    try {
      console.log('🔍 Checking weather for all farmers...');

      // Get all active farmers with location data
      const farmers = await Farmer.find({
        isActive: true,
        $or: [
          { 'farmLocation.coordinates': { $exists: true } },
          { $and: [{ state: { $exists: true } }, { district: { $exists: true } }] }
        ]
      }).select('_id state district farmLocation preferredLanguage actualCrops');

      console.log(`📊 Found ${farmers.length} farmers to check`);

      let alertsCreated = 0;
      const batchSize = 10; // Process farmers in batches to avoid API limits

      for (let i = 0; i < farmers.length; i += batchSize) {
        const batch = farmers.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (farmer) => {
          try {
            const alerts = await this.checkFarmerWeather(farmer);
            alertsCreated += alerts;
          } catch (error) {
            console.error(`❌ Failed to check weather for farmer ${farmer._id}:`, error.message);
          }
        }));

        // Small delay between batches to respect API limits
        if (i + batchSize < farmers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Weather check completed. Created ${alertsCreated} alerts`);
    } catch (error) {
      console.error('❌ Failed to check farmers weather:', error);
    }
  }

  /**
   * Check weather for individual farmer
   */
  async checkFarmerWeather(farmer) {
    try {
      // Get farmer coordinates
      let coordinates;
      if (farmer.farmLocation?.coordinates) {
        coordinates = farmer.farmLocation.coordinates;
      } else if (farmer.state && farmer.district) {
        const locationData = await openMeteoService.getCoordinates(farmer.district, farmer.state);
        coordinates = {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        };
      } else {
        console.warn(`⚠️ No location data for farmer ${farmer._id}`);
        return 0;
      }

      // Get current weather and 24-hour forecast
      const [currentWeather, forecast] = await Promise.all([
        openMeteoService.getCurrentWeather(coordinates.latitude, coordinates.longitude),
        openMeteoService.getWeatherForecast(coordinates.latitude, coordinates.longitude, 1)
      ]);

      // Check for critical conditions
      const criticalConditions = this.identifyCriticalConditions(currentWeather, forecast);
      
      if (Object.keys(criticalConditions).length === 0) {
        return 0; // No alerts needed
      }

      // Get farmer's crops
      const crops = await cropMappingService.getRecommendedCrops(
        farmer.state, 
        farmer.actualCrops
      );

      // Create alerts for critical conditions
      let alertsCreated = 0;
      for (const [conditionType, conditionData] of Object.entries(criticalConditions)) {
        const alert = await this.createWeatherAlert(
          farmer._id,
          conditionType,
          conditionData,
          coordinates,
          crops,
          farmer.preferredLanguage || 'en'
        );

        if (alert) {
          alertsCreated++;
          
          // Send immediate notification for critical alerts
          if (alert.severity === 'critical' || alert.severity === 'high') {
            await this.sendAlertNotification(farmer, alert);
          }
        }
      }

      return alertsCreated;
    } catch (error) {
      console.error(`Failed to check weather for farmer ${farmer._id}:`, error);
      return 0;
    }
  }

  /**
   * Identify critical weather conditions
   */
  identifyCriticalConditions(currentWeather, forecast) {
    const conditions = {};
    
    // Check current conditions
    if (currentWeather.precipitation > this.alertThresholds.heavyRain) {
      conditions.heavy_rain = {
        severity: 'high',
        value: currentWeather.precipitation,
        message: `Heavy rainfall of ${currentWeather.precipitation}mm detected`
      };
    }

    if (currentWeather.temperature > this.alertThresholds.extremeHeat) {
      conditions.extreme_heat = {
        severity: currentWeather.temperature > 45 ? 'critical' : 'high',
        value: currentWeather.temperature,
        message: `Extreme heat of ${currentWeather.temperature}°C`
      };
    }

    if (currentWeather.temperature < this.alertThresholds.extremeCold) {
      conditions.extreme_cold = {
        severity: currentWeather.temperature < 0 ? 'critical' : 'high',
        value: currentWeather.temperature,
        message: `Extreme cold of ${currentWeather.temperature}°C`
      };
    }

    if (currentWeather.windSpeed > this.alertThresholds.strongWinds) {
      conditions.strong_winds = {
        severity: currentWeather.windSpeed > 40 ? 'high' : 'medium',
        value: currentWeather.windSpeed,
        message: `Strong winds of ${currentWeather.windSpeed} km/h`
      };
    }

    // Frost conditions
    if (currentWeather.temperature < this.alertThresholds.frost && currentWeather.humidity > 80) {
      conditions.frost = {
        severity: 'high',
        value: currentWeather.temperature,
        message: `Frost conditions: ${currentWeather.temperature}°C with high humidity`
      };
    }

    // Hail conditions
    if (this.alertThresholds.hail.includes(currentWeather.weatherCode)) {
      conditions.hail = {
        severity: 'critical',
        value: currentWeather.weatherCode,
        message: 'Hailstorm conditions detected'
      };
    }

    // Check forecast for upcoming conditions
    if (forecast && forecast.forecast.length > 0) {
      const tomorrow = forecast.forecast[0];
      
      if (tomorrow.precipitation.total > this.alertThresholds.heavyRain) {
        conditions.upcoming_rain = {
          severity: 'medium',
          value: tomorrow.precipitation.total,
          message: `Heavy rain expected tomorrow: ${tomorrow.precipitation.total}mm`,
          timing: 'tomorrow'
        };
      }
    }

    return conditions;
  }

  /**
   * Create weather alert
   */
  async createWeatherAlert(farmerId, conditionType, conditionData, coordinates, crops, language) {
    try {
      // Check if similar alert already exists (within last 6 hours)
      const existingAlert = await WeatherAlert.findOne({
        farmerId: farmerId,
        alertType: conditionType,
        createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      });

      if (existingAlert) {
        return null; // Don't create duplicate alerts
      }

      // Generate AI-powered alert message
      let alertMessage = conditionData.message;
      let recommendations = this.getDefaultRecommendations(conditionType, crops);

      try {
        const aiAlert = await chatAnywhereService.generateAlertMessage(
          conditionType,
          { 
            temperature: conditionData.value,
            condition: conditionType,
            description: conditionData.message
          },
          crops,
          language
        );

        if (aiAlert && aiAlert.message) {
          alertMessage = aiAlert.message;
        }
      } catch (error) {
        console.warn('AI alert generation failed, using fallback:', error.message);
      }

      // Create alert
      const alert = new WeatherAlert({
        farmerId: farmerId,
        alertType: conditionType,
        severity: conditionData.severity,
        message: alertMessage,
        recommendations: recommendations,
        location: {
          coordinates: coordinates
        },
        validFrom: new Date(),
        validUntil: new Date(Date.now() + (conditionData.timing === 'tomorrow' ? 48 : 24) * 60 * 60 * 1000),
        metadata: {
          value: conditionData.value,
          source: 'automated',
          crops: crops.map(c => c.name)
        }
      });

      await alert.save();
      console.log(`✅ Created ${conditionType} alert for farmer ${farmerId}`);
      
      return alert;
    } catch (error) {
      console.error('Failed to create weather alert:', error);
      return null;
    }
  }

  /**
   * Get default recommendations for alert types
   */
  getDefaultRecommendations(alertType, crops) {
    const recommendations = {
      heavy_rain: [
        'Postpone pesticide and fertilizer application',
        'Ensure proper field drainage',
        'Secure farm equipment and structures',
        'Monitor crop health after rainfall'
      ],
      extreme_heat: [
        'Increase irrigation frequency',
        'Provide shade to sensitive crops',
        'Avoid midday field operations',
        'Monitor crops for heat stress'
      ],
      extreme_cold: [
        'Cover sensitive crops if possible',
        'Use water spray for frost protection',
        'Harvest mature crops immediately',
        'Monitor for cold damage'
      ],
      strong_winds: [
        'Provide support to tall crops',
        'Secure farm structures',
        'Postpone pesticide spraying',
        'Check for wind damage after storm'
      ],
      frost: [
        'Use frost protection methods',
        'Light fires or use heaters if available',
        'Water spray early morning',
        'Cover young plants'
      ],
      hail: [
        'Seek immediate shelter',
        'Protect vehicles and equipment',
        'Document damage for insurance',
        'Check crop damage after hailstorm'
      ]
    };

    return recommendations[alertType] || ['Monitor weather conditions closely'];
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(farmer, alert) {
    try {
      // Prepare notification data
      const notificationData = {
        userId: farmer._id,
        type: 'weather_alert',
        title: `Weather Alert: ${alert.alertType.replace('_', ' ').toUpperCase()}`,
        message: alert.message,
        severity: alert.severity,
        data: {
          alertId: alert._id,
          alertType: alert.alertType,
          recommendations: alert.recommendations.slice(0, 2) // Send top 2 recommendations
        }
      };

      // Send notification (implement based on your notification system)
      await sendNotification(notificationData);
      
      console.log(`📱 Sent notification for ${alert.alertType} alert to farmer ${farmer._id}`);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  /**
   * Generate daily AI advisories for all farmers
   */
  async generateDailyAdvisories() {
    try {
      console.log('📝 Generating daily advisories...');

      const farmers = await Farmer.find({
        isActive: true,
        $or: [
          { 'farmLocation.coordinates': { $exists: true } },
          { $and: [{ state: { $exists: true } }, { district: { $exists: true } }] }
        ]
      }).select('_id state district farmLocation preferredLanguage actualCrops');

      let advisoriesGenerated = 0;
      const batchSize = 5; // Smaller batches for AI calls

      for (let i = 0; i < farmers.length; i += batchSize) {
        const batch = farmers.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (farmer) => {
          try {
            const generated = await this.generateFarmerDailyAdvisory(farmer);
            if (generated) advisoriesGenerated++;
          } catch (error) {
            console.error(`Failed to generate advisory for farmer ${farmer._id}:`, error.message);
          }
        }));

        // Delay between batches to manage API rate limits
        if (i + batchSize < farmers.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`✅ Generated ${advisoriesGenerated} daily advisories`);
    } catch (error) {
      console.error('Failed to generate daily advisories:', error);
    }
  }

  /**
   * Generate daily advisory for individual farmer
   */
  async generateFarmerDailyAdvisory(farmer) {
    try {
      // Check if today's advisory already exists
      const today = new Date().toISOString().split('T')[0];
      const existingAdvisory = await WeatherAdvisory.findOne({
        farmerId: farmer._id,
        date: today
      });

      if (existingAdvisory) {
        return false; // Already generated
      }

      // Get farmer location
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

      // Get weather data
      const [currentWeather, forecast] = await Promise.all([
        openMeteoService.getCurrentWeather(coordinates.latitude, coordinates.longitude),
        openMeteoService.getWeatherForecast(coordinates.latitude, coordinates.longitude, 3)
      ]);

      // Get farmer's crops
      const crops = await cropMappingService.getRecommendedCrops(
        farmer.state,
        farmer.actualCrops
      );

      // Generate AI advisory
      const aiAdvice = await chatAnywhereService.generateFarmingAdvice(
        currentWeather,
        { state: farmer.state, district: farmer.district },
        crops,
        farmer.preferredLanguage || 'en'
      );

      // Create advisory record
      const advisory = new WeatherAdvisory({
        farmerId: farmer._id,
        date: today,
        location: {
          state: farmer.state,
          district: farmer.district,
          coordinates: coordinates
        },
        weatherConditions: {
          temperature: currentWeather.temperature,
          precipitation: currentWeather.precipitation,
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windSpeed,
          condition: currentWeather.weatherCondition,
          weatherCode: currentWeather.weatherCode
        },
        crops: crops.map(crop => ({
          name: crop.name,
          localName: crop.local_name,
          season: cropMappingService.getCurrentSeason(),
          waterRequirement: crop.water_requirement
        })),
        advice: aiAdvice,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await advisory.save();
      console.log(`✅ Generated daily advisory for farmer ${farmer._id}`);
      
      return true;
    } catch (error) {
      console.error(`Failed to generate advisory for farmer ${farmer._id}:`, error);
      return false;
    }
  }

  /**
   * Clean up old alerts and advisories
   */
  async cleanupOldAlerts() {
    try {
      console.log('🧹 Cleaning up old alerts and advisories...');

      // Delete alerts older than 7 days
      const oldAlertsResult = await WeatherAlert.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      // Delete advisories older than 30 days
      const oldAdvisoriesResult = await WeatherAdvisory.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      console.log(`✅ Cleanup completed:`);
      console.log(`   - Deleted ${oldAlertsResult.deletedCount} old alerts`);
      console.log(`   - Deleted ${oldAdvisoriesResult.deletedCount} old advisories`);
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.cronJobs.length,
      alertThresholds: this.alertThresholds,
      uptime: this.isRunning ? process.uptime() : 0
    };
  }
}

// Create singleton instance
const weatherAlertService = new WeatherAlertService();

export default weatherAlertService;
