// backend/services/weatherService.js - WEATHER DATA SERVICE WITH OPENWEATHER API
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

class WeatherService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall';
    
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  // Get current weather
  async getCurrentWeather(lat, lon, location = 'Farm Location') {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.openWeatherApiKey,
          units: 'metric',
          lang: 'en'
        },
        timeout: 10000
      });

      const data = response.data;
      
      return {
        location: {
          name: data.name || location,
          country: data.sys.country,
          coordinates: { lat, lon }
        },
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000), // Convert to km
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert to km/h
          windDirection: data.wind.deg,
          cloudCover: data.clouds.all,
          condition: {
            main: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon
          },
          uv: 0, // Will be updated from OneCall API
          rainfall: data.rain?.['1h'] || 0
        },
        sun: {
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000)
        },
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error('Weather API Error:', error.message);
      throw new Error('Unable to fetch current weather data');
    }
  }

  // Get 7-day forecast using OneCall API 3.0
  async getWeatherForecast(lat, lon, days = 7) {
    try {
      const response = await axios.get(this.oneCallUrl, {
        params: {
          lat,
          lon,
          appid: this.openWeatherApiKey,
          units: 'metric',
          exclude: 'minutely,alerts'
        },
        timeout: 15000
      });

      const data = response.data;
      
      // Format daily forecast
      const forecast = data.daily.slice(0, days).map((day, index) => ({
        date: new Date(day.dt * 1000),
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
          morning: Math.round(day.temp.morn),
          day: Math.round(day.temp.day),
          evening: Math.round(day.temp.eve),
          night: Math.round(day.temp.night)
        },
        condition: {
          main: day.weather[0].main,
          description: day.weather[0].description,
          icon: day.weather[0].icon
        },
        humidity: day.humidity,
        pressure: day.pressure,
        windSpeed: Math.round(day.wind_speed * 3.6),
        windDirection: day.wind_deg,
        cloudCover: day.clouds,
        precipitationProbability: Math.round(day.pop * 100),
        rainfall: day.rain || 0,
        uv: day.uvi,
        isToday: index === 0,
        isTomorrow: index === 1
      }));

      return {
        location: { lat, lon },
        forecast,
        generatedAt: new Date()
      };
      
    } catch (error) {
      console.error('Forecast API Error:', error.message);
      throw new Error('Unable to fetch weather forecast');
    }
  }

  // Generate AI insights using Gemini
  async generateWeatherInsights(weatherData, forecastData, farmerProfile = {}) {
    if (!this.model) {
      return this.generateBasicInsights(weatherData, forecastData);
    }

    try {
      const prompt = this.buildGeminiPrompt(weatherData, forecastData, farmerProfile);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      return this.parseGeminiResponse(insights);
      
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      return this.generateBasicInsights(weatherData, forecastData);
    }
  }

  // Build comprehensive prompt for Gemini
  buildGeminiPrompt(weather, forecast, farmer) {
    const cropInfo = farmer.crops?.join(', ') || 'wheat, rice';
    const location = farmer.location || 'Punjab, India';
    const currentSeason = this.getCurrentSeason();

    return `
You are an expert agricultural advisor for farmers in India. Analyze this weather data and provide farming insights in a mix of Hindi and English (Hinglish) that farmers can easily understand.

CURRENT WEATHER:
- Temperature: ${weather.current.temperature}°C (feels like ${weather.current.feelsLike}°C)
- Humidity: ${weather.current.humidity}%
- Wind: ${weather.current.windSpeed} km/h
- Condition: ${weather.current.condition.description}
- Rainfall: ${weather.current.rainfall}mm

7-DAY FORECAST:
${forecast.forecast.map((day, index) => 
  `Day ${index + 1}: ${day.temperature.min}-${day.temperature.max}°C, ${day.condition.description}, ${day.precipitationProbability}% rain chance`
).join('\n')}

FARMER CONTEXT:
- Location: ${location}  
- Crops: ${cropInfo}
- Season: ${currentSeason}

Please provide:
1. **Daily Actions** (next 3 days) - What should farmers do each day?
2. **Weather Warnings** - Any immediate concerns or alerts
3. **Crop-Specific Advice** - Specific guidance for their crops
4. **Planning Tips** - Weekly planning recommendations

Format your response in this JSON structure:
{
  "dailyActions": [
    {"day": "Today", "actions": ["action1", "action2"], "priority": "high/medium/low"},
    {"day": "Tomorrow", "actions": ["action1", "action2"], "priority": "high/medium/low"},
    {"day": "Day 3", "actions": ["action1", "action2"], "priority": "high/medium/low"}
  ],
  "warnings": [
    {"type": "temperature/rain/wind", "message": "Warning message in Hinglish", "severity": "high/medium/low"}
  ],
  "cropAdvice": [
    {"crop": "wheat", "advice": "Specific advice in Hinglish"},
    {"crop": "rice", "advice": "Specific advice in Hinglish"}
  ],
  "weeklyPlanning": "Overall planning advice for the week in Hinglish"
}

Use simple Hinglish like:
- "Kal barish ho sakti hai, spray mat kariye"
- "Temperature zyada hai, irrigation karni padegi"
- "Hawa tez hai, crops ko support dena chahiye"
    `;
  }

  // Parse Gemini response
  parseGeminiResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          insights: parsedData,
          generatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }

    // Fallback parsing
    return {
      success: false,
      insights: {
        dailyActions: [
          {
            day: "Today",
            actions: ["Check weather conditions", "Monitor crop health"],
            priority: "medium"
          }
        ],
        warnings: [],
        cropAdvice: [],
        weeklyPlanning: "Continue regular farming activities based on weather conditions."
      },
      generatedAt: new Date()
    };
  }

  // Generate basic insights without AI
  generateBasicInsights(weather, forecast) {
    const insights = {
      dailyActions: [],
      warnings: [],
      cropAdvice: [],
      weeklyPlanning: "Monitor weather conditions daily and adjust farming activities accordingly."
    };

    // Generate basic daily actions
    forecast.forecast.slice(0, 3).forEach((day, index) => {
      const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`;
      const actions = [];
      let priority = 'medium';

      if (day.precipitationProbability > 70) {
        actions.push('Avoid spraying operations - rain expected');
        actions.push('Ensure proper drainage in fields');
        priority = 'high';
      } else if (day.temperature.max > 35) {
        actions.push('Increase irrigation frequency');
        actions.push('Provide shade protection if possible');
        priority = 'high';
      } else if (day.windSpeed > 25) {
        actions.push('Secure loose structures');
        actions.push('Check crop support systems');
        priority = 'medium';
      } else {
        actions.push('Regular field monitoring');
        actions.push('Continue normal operations');
      }

      insights.dailyActions.push({ day: dayName, actions, priority });
    });

    // Generate warnings
    if (weather.current.temperature > 40) {
      insights.warnings.push({
        type: 'temperature',
        message: 'Extreme heat - take immediate protective measures',
        severity: 'high'
      });
    }

    const rainDays = forecast.forecast.filter(day => day.precipitationProbability > 60).length;
    if (rainDays >= 3) {
      insights.warnings.push({
        type: 'rain',
        message: 'Heavy rain expected this week - prepare drainage',
        severity: 'medium'
      });
    }

    return {
      success: true,
      insights,
      generatedAt: new Date()
    };
  }

  // Get current season
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) return 'Kharif';
    if (month >= 10 && month <= 3) return 'Rabi';
    return 'Summer';
  }

  // Check for severe weather alerts
  checkSevereWeatherAlerts(weather, forecast) {
    const alerts = [];

    // Temperature alerts
    if (weather.current.temperature > 42) {
      alerts.push({
        type: 'heatwave',
        severity: 'severe',
        message: `Extreme heat alert: ${weather.current.temperature}°C - Take immediate action to protect crops`,
        actions: ['Increase irrigation', 'Provide shade', 'Avoid field work during peak hours']
      });
    }

    // Wind alerts
    if (weather.current.windSpeed > 40) {
      alerts.push({
        type: 'strongwind',
        severity: 'severe',
        message: `Strong wind alert: ${weather.current.windSpeed} km/h - Secure equipment and structures`,
        actions: ['Secure loose structures', 'Support tall crops', 'Avoid spraying']
      });
    }

    // Rain alerts
    const heavyRainDays = forecast.forecast.filter(day => day.precipitationProbability > 80).length;
    if (heavyRainDays >= 2) {
      alerts.push({
        type: 'heavyrain',
        severity: 'moderate',
        message: 'Heavy rainfall expected - prepare for waterlogging',
        actions: ['Clear drainage', 'Postpone harvesting', 'Secure stored grain']
      });
    }

    return alerts;
  }
}

export default new WeatherService();
