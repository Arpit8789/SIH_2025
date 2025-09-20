// backend/utils/weatherScheduler.js - AUTOMATED WEATHER EMAIL SCHEDULER
import cron from 'node-cron';
import weatherService from '../services/weatherService.js';
import emailService from '../services/emailService.js';
import Farmer from '../models/Farmer.js';

class WeatherScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start weather email scheduler
  start() {
    if (this.isRunning) {
      console.log('Weather scheduler is already running');
      return;
    }

    console.log('🌦️ Starting Weather Email Scheduler...');

    // Morning alerts at 9:00 AM IST
    cron.schedule('0 9 * * *', async () => {
      console.log('🌅 Running morning weather alerts...');
      await this.sendScheduledWeatherAlerts('morning');
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Evening alerts at 9:00 PM IST  
    cron.schedule('0 21 * * *', async () => {
      console.log('🌙 Running evening weather alerts...');
      await this.sendScheduledWeatherAlerts('evening');
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.isRunning = true;
    console.log('✅ Weather scheduler started successfully');
    console.log('📧 Emails will be sent at 9:00 AM and 9:00 PM IST daily');
  }

  // Send scheduled weather alerts
  async sendScheduledWeatherAlerts(timeOfDay) {
    try {
      console.log(`📨 Sending ${timeOfDay} weather alerts...`);

      // Get all farmers with email notifications enabled
      const farmers = await Farmer.find({
        'emailNotifications.weather': true,
        email: { $exists: true, $ne: null }
      }).select('name email farmLocation crops emailNotifications');

      if (farmers.length === 0) {
        console.log('No farmers found with weather email notifications enabled');
        return;
      }

      console.log(`Found ${farmers.length} farmers for weather alerts`);

      // Group farmers by location to optimize weather API calls
      const locationGroups = this.groupFarmersByLocation(farmers);
      
      let totalSent = 0;
      let totalFailed = 0;

      for (const [locationKey, locationFarmers] of locationGroups) {
        try {
          const [lat, lon] = locationKey.split(',').map(Number);
          
          // Get weather data for this location
          const [weatherData, forecastData] = await Promise.all([
            weatherService.getCurrentWeather(lat, lon),
            weatherService.getWeatherForecast(lat, lon, 7)
          ]);

          // Generate AI insights
          const insights = await weatherService.generateWeatherInsights(
            weatherData,
            forecastData,
            { crops: ['wheat', 'rice'], location: 'Punjab' }
          );

          // Send emails to all farmers in this location
          const emailResults = await emailService.sendBulkWeatherAlerts(
            locationFarmers,
            weatherData,
            insights,
            timeOfDay
          );

          // Count results
          const successful = emailResults.filter(r => r.success).length;
          const failed = emailResults.filter(r => !r.success).length;
          
          totalSent += successful;
          totalFailed += failed;

          console.log(`Location ${locationKey}: ${successful} sent, ${failed} failed`);

        } catch (error) {
          console.error(`Error processing location ${locationKey}:`, error.message);
          totalFailed += locationFarmers.length;
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`📊 ${timeOfDay} weather alerts completed:`);
      console.log(`✅ Successfully sent: ${totalSent}`);
      console.log(`❌ Failed: ${totalFailed}`);

    } catch (error) {
      console.error(`❌ Error in scheduled weather alerts (${timeOfDay}):`, error);
    }
  }

  // Group farmers by location to optimize API calls
  groupFarmersByLocation(farmers) {
    const groups = new Map();

    farmers.forEach(farmer => {
      if (farmer.farmLocation?.coordinates) {
        const lat = Math.round(farmer.farmLocation.coordinates.latitude * 10) / 10;
        const lon = Math.round(farmer.farmLocation.coordinates.longitude * 10) / 10;
        const key = `${lat},${lon}`;

        if (!groups.has(key)) {
          groups.set(key, []);
        }

        groups.get(key).push({
          name: farmer.name,
          email: farmer.email,
          crops: farmer.crops || []
        });
      }
    });

    return groups;
  }

  // Stop scheduler
  stop() {
    if (this.isRunning) {
      console.log('🛑 Stopping weather scheduler...');
      this.isRunning = false;
      console.log('✅ Weather scheduler stopped');
    }
  }

  // Send immediate weather alert to specific farmer
  async sendImmediateAlert(farmerId, alertType = 'severe') {
    try {
      const farmer = await Farmer.findById(farmerId).select('name email farmLocation crops');
      
      if (!farmer || !farmer.email) {
        throw new Error('Farmer not found or email not available');
      }

      if (!farmer.farmLocation?.coordinates) {
        throw new Error('Farm location coordinates not available');
      }

      const { latitude, longitude } = farmer.farmLocation.coordinates;

      // Get current weather and forecast
      const [weatherData, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 3)
      ]);

      // Generate insights
      const insights = await weatherService.generateWeatherInsights(
        weatherData,
        forecastData,
        { crops: farmer.crops, location: farmer.farmLocation.district }
      );

      // Send email
      const result = await emailService.sendWeatherAlert(
        farmer.email,
        farmer.name,
        weatherData,
        insights,
        'urgent'
      );

      return result;

    } catch (error) {
      console.error('Error sending immediate weather alert:', error);
      throw error;
    }
  }
}

export default new WeatherScheduler();
