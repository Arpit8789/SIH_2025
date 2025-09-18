// backend/services/openMeteoService.js
import axios from 'axios';
import moment from 'moment-timezone';

class OpenMeteoService {
  constructor() {
    this.baseURL = 'https://api.open-meteo.com/v1';
    this.geocodingURL = 'https://geocoding-api.open-meteo.com/v1';
  }

  /**
   * Get coordinates from city/state name
   */
  async getCoordinates(city, state = '', country = 'India') {
    try {
      const searchQuery = `${city}, ${state}, ${country}`.replace(/,+/g, ',').replace(/^,|,$/g, '');
      
      const response = await axios.get(`${this.geocodingURL}/search`, {
        params: {
          name: searchQuery,
          count: 1,
          language: 'en',
          format: 'json'
        },
        timeout: 10000
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name,
          admin1: result.admin1, // State
          country: result.country
        };
      }

      throw new Error(`Location not found: ${searchQuery}`);
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw new Error(`Failed to get coordinates for ${city}: ${error.message}`);
    }
  }

  /**
   * Get current weather data
   */
  async getCurrentWeather(latitude, longitude, timezone = 'Asia/Kolkata') {
    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'rain',
            'showers',
            'snowfall',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'surface_pressure',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m'
          ].join(','),
          timezone: timezone,
          forecast_days: 1
        },
        timeout: 15000
      });

      const current = response.data.current;
      const currentTime = moment().tz(timezone);

      return {
        timestamp: currentTime.toISOString(),
        temperature: Math.round(current.temperature_2m * 10) / 10,
        apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation || 0,
        rain: current.rain || 0,
        weatherCode: current.weather_code,
        weatherDescription: this.getWeatherDescription(current.weather_code),
        weatherCondition: this.getWeatherCondition(current.weather_code),
        cloudCover: current.cloud_cover,
        pressure: current.pressure_msl,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        windDirection: current.wind_direction_10m,
        windGusts: current.wind_gusts_10m,
        isDay: current.is_day === 1,
        uvIndex: 0, // Not available in current, need daily data
        visibility: 10000, // Default visibility in meters
        coordinates: { latitude, longitude }
      };
    } catch (error) {
      console.error('Current weather fetch error:', error.message);
      throw new Error(`Failed to fetch current weather: ${error.message}`);
    }
  }

  /**
   * Get 7-day weather forecast
   */
  async getWeatherForecast(latitude, longitude, days = 7, timezone = 'Asia/Kolkata') {
    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'apparent_temperature_max',
            'apparent_temperature_min',
            'sunrise',
            'sunset',
            'daylight_duration',
            'sunshine_duration',
            'uv_index_max',
            'precipitation_sum',
            'rain_sum',
            'showers_sum',
            'snowfall_sum',
            'precipitation_hours',
            'precipitation_probability_max',
            'wind_speed_10m_max',
            'wind_gusts_10m_max',
            'wind_direction_10m_dominant',
            'shortwave_radiation_sum'
          ].join(','),
          timezone: timezone,
          forecast_days: days
        },
        timeout: 15000
      });

      const daily = response.data.daily;
      const forecast = [];

      for (let i = 0; i < daily.time.length; i++) {
        const date = moment(daily.time[i]).tz(timezone);
        
        forecast.push({
          date: date.format('YYYY-MM-DD'),
          formattedDate: date.format('MMM DD'),
          dayName: date.format('dddd'),
          temperature: {
            max: Math.round(daily.temperature_2m_max[i]),
            min: Math.round(daily.temperature_2m_min[i]),
            average: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2)
          },
          apparentTemperature: {
            max: Math.round(daily.apparent_temperature_max[i]),
            min: Math.round(daily.apparent_temperature_min[i])
          },
          weatherCode: daily.weather_code[i],
          weatherDescription: this.getWeatherDescription(daily.weather_code[i]),
          weatherCondition: this.getWeatherCondition(daily.weather_code[i]),
          precipitation: {
            total: daily.precipitation_sum[i] || 0,
            rain: daily.rain_sum[i] || 0,
            snow: daily.snowfall_sum[i] || 0,
            probability: daily.precipitation_probability_max[i] || 0,
            hours: daily.precipitation_hours[i] || 0
          },
          wind: {
            speed: Math.round(daily.wind_speed_10m_max[i] * 10) / 10,
            direction: daily.wind_direction_10m_dominant[i],
            gusts: daily.wind_gusts_10m_max[i]
          },
          sun: {
            sunrise: daily.sunrise[i],
            sunset: daily.sunset[i],
            daylight: daily.daylight_duration[i],
            sunshine: daily.sunshine_duration[i]
          },
          uvIndex: daily.uv_index_max[i] || 0,
          solarRadiation: daily.shortwave_radiation_sum[i] || 0
        });
      }

      return {
        location: { latitude, longitude },
        forecast: forecast,
        generatedAt: moment().tz(timezone).toISOString()
      };
    } catch (error) {
      console.error('Weather forecast fetch error:', error.message);
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }
  }

  /**
   * Get hourly weather forecast (24-48 hours)
   */
  async getHourlyForecast(latitude, longitude, hours = 24, timezone = 'Asia/Kolkata') {
    try {
      const days = Math.ceil(hours / 24);
      
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          hourly: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'precipitation_probability',
            'precipitation',
            'rain',
            'weather_code',
            'cloud_cover',
            'wind_speed_10m',
            'wind_direction_10m',
            'is_day'
          ].join(','),
          timezone: timezone,
          forecast_days: days
        },
        timeout: 15000
      });

      const hourly = response.data.hourly;
      const forecast = [];
      const now = moment().tz(timezone);

      for (let i = 0; i < Math.min(hours, hourly.time.length); i++) {
        const time = moment(hourly.time[i]).tz(timezone);
        
        // Skip past hours
        if (time.isBefore(now)) continue;

        forecast.push({
          time: time.toISOString(),
          hour: time.format('HH:mm'),
          formattedTime: time.format('MMM DD, HH:mm'),
          temperature: Math.round(hourly.temperature_2m[i]),
          apparentTemperature: Math.round(hourly.apparent_temperature[i]),
          humidity: hourly.relative_humidity_2m[i],
          precipitation: {
            amount: hourly.precipitation[i] || 0,
            rain: hourly.rain[i] || 0,
            probability: hourly.precipitation_probability[i] || 0
          },
          weatherCode: hourly.weather_code[i],
          weatherCondition: this.getWeatherCondition(hourly.weather_code[i]),
          cloudCover: hourly.cloud_cover[i],
          wind: {
            speed: Math.round(hourly.wind_speed_10m[i] * 10) / 10,
            direction: hourly.wind_direction_10m[i]
          },
          isDay: hourly.is_day[i] === 1
        });
      }

      return {
        location: { latitude, longitude },
        hourlyForecast: forecast.slice(0, hours),
        generatedAt: now.toISOString()
      };
    } catch (error) {
      console.error('Hourly forecast fetch error:', error.message);
      throw new Error(`Failed to fetch hourly forecast: ${error.message}`);
    }
  }

  /**
   * Convert WMO weather codes to readable descriptions
   */
  getWeatherDescription(code) {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };

    return weatherCodes[code] || 'Unknown weather condition';
  }

  /**
   * Get simplified weather condition for UI
   */
  getWeatherCondition(code) {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2 || code === 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 86) return 'snow';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'cloudy';
  }

  /**
   * Check if weather conditions are critical for farming
   */
  identifyCriticalConditions(weatherData) {
    const conditions = {
      heavyRain: false,
      strongWinds: false,
      extremeTemperature: false,
      frost: false,
      hail: false,
      drought: false
    };

    // Heavy rain check
    if (weatherData.precipitation > 25 || weatherData.rain > 25) {
      conditions.heavyRain = true;
    }

    // Strong winds check
    if (weatherData.windSpeed > 25 || weatherData.windGusts > 40) {
      conditions.strongWinds = true;
    }

    // Extreme temperature check
    if (weatherData.temperature > 40 || weatherData.temperature < 5) {
      conditions.extremeTemperature = true;
    }

    // Frost check (low temperature + high humidity)
    if (weatherData.temperature < 4 && weatherData.humidity > 80) {
      conditions.frost = true;
    }

    // Hail check (thunderstorm codes with precipitation)
    if ((weatherData.weatherCode === 96 || weatherData.weatherCode === 99) && weatherData.precipitation > 0) {
      conditions.hail = true;
    }

    return conditions;
  }
}

export default new OpenMeteoService();
