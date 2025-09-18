// backend/services/chatAnywhereService.js
import axios from 'axios';
import config from '../config/config.js';

class ChatAnywhereService {
  constructor() {
    this.baseURL = 'https://api.chatanywhere.tech/v1'; // ChatAnywhere API endpoint
    this.apiKey = config.chatAnywhereApiKey; // Add this to your config
    this.model = 'gpt-3.5-turbo'; // Default model
    this.maxTokens = 150; // Keep responses short for farming advice
  }

  /**
   * Generate farming advice based on weather and crops
   */
  async generateFarmingAdvice(weatherData, location, crops, language = 'en') {
    try {
      const prompt = this.buildFarmingAdvicePrompt(weatherData, location, crops, language);
      
      const response = await this.callChatAnywhereAPI(prompt, {
        temperature: 0.7,
        max_tokens: this.maxTokens
      });

      return this.parseFarmingAdvice(response);
    } catch (error) {
      console.error('AI farming advice generation error:', error.message);
      // Return fallback advice
      return this.getFallbackAdvice(weatherData, language);
    }
  }

  /**
   * Generate weather alert message with farming context
   */
  async generateAlertMessage(alertType, weatherData, crops, language = 'en') {
    try {
      const prompt = this.buildAlertPrompt(alertType, weatherData, crops, language);
      
      const response = await this.callChatAnywhereAPI(prompt, {
        temperature: 0.6,
        max_tokens: 100
      });

      return this.parseAlertMessage(response);
    } catch (error) {
      console.error('AI alert generation error:', error.message);
      return this.getFallbackAlert(alertType, weatherData, language);
    }
  }

  /**
   * Build comprehensive farming advice prompt
   */
  buildFarmingAdvicePrompt(weatherData, location, crops, language) {
    const weatherDesc = `${weatherData.temperature}°C, ${weatherData.weatherDescription}, humidity ${weatherData.humidity}%, wind ${weatherData.windSpeed} km/h`;
    const cropList = crops.map(crop => crop.name).join(', ');
    
    const systemPrompt = language === 'hi' 
      ? `आप एक अनुभवी भारतीय कृषि सलाहकार हैं। सरल हिंदी में 2-3 छोटी व्यावहारिक सलाह दें।`
      : `You are an experienced Indian agricultural advisor. Give 2-3 short, practical farming tips in simple language.`;

    const userPrompt = language === 'hi'
      ? `स्थान: ${location.state}, ${location.district}
मौसम: ${weatherDesc}
फसलें: ${cropList}
मुझे आज की खेती के लिए व्यावहारिक सलाह दें। कृपया सरल भाषा में जवाब दें और तकनीकी शब्दों से बचें।`
      : `Location: ${location.state}, ${location.district}
Weather: ${weatherDesc}
Crops: ${cropList}
Give me practical farming advice for today. Please respond in simple language and avoid technical jargon.`;

    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  /**
   * Build weather alert prompt
   */
  buildAlertPrompt(alertType, weatherData, crops, language) {
    const systemPrompt = language === 'hi'
      ? `आप एक कृषि चेतावनी विशेषज्ञ हैं। ${alertType} के बारे में 1-2 छोटे वाक्यों में अत्यावश्यक सलाह दें।`
      : `You are an agricultural alert specialist. Give urgent advice about ${alertType} in 1-2 short sentences.`;

    const userPrompt = language === 'hi'
      ? `${alertType} की स्थिति में ${crops.map(c => c.name).join(', ')} फसल के लिए तुरंत क्या करना चाहिए?`
      : `What should be done immediately for ${crops.map(c => c.name).join(', ')} crops during ${alertType}?`;

    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  /**
   * Call ChatAnywhere API
   */
  async callChatAnywhereAPI(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('ChatAnywhere API key not configured');
    }

    const requestData = {
      model: this.model,
      messages: [
        {
          role: "system",
          content: prompt.system
        },
        {
          role: "user", 
          content: prompt.user
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || this.maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
      throw new Error(`Network Error: ${error.message}`);
    }
  }

  /**
   * Parse and structure farming advice
   */
  parseFarmingAdvice(aiResponse) {
    const advice = aiResponse.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 10); // Filter out very short lines

    return {
      primaryAdvice: advice[0] || 'Monitor your crops regularly.',
      additionalTips: advice.slice(1, 3), // Max 2 additional tips
      generatedAt: new Date().toISOString(),
      source: 'ai'
    };
  }

  /**
   * Parse alert message
   */
  parseAlertMessage(aiResponse) {
    return {
      message: aiResponse.replace(/^[-•*]\s*/, '').trim(),
      urgency: 'high',
      generatedAt: new Date().toISOString(),
      source: 'ai'
    };
  }

  /**
   * Fallback advice when AI fails
   */
  getFallbackAdvice(weatherData, language = 'en') {
    const advice = {
      en: {
        rain: "Rain expected - postpone pesticide spraying and ensure proper drainage.",
        hot: "High temperature - increase irrigation frequency and provide shade to crops.",
        cold: "Cold weather - protect crops from frost and reduce watering.",
        windy: "Strong winds expected - secure tall crops and avoid spraying.",
        default: "Monitor your crops regularly and follow weather-appropriate farming practices."
      },
      hi: {
        rain: "बारिश होने वाली है - कीटनाशक छिड़काव बंद करें और पानी की निकासी सुनिश्चित करें।",
        hot: "अधिक गर्मी - सिंचाई बढ़ाएं और फसलों को छाया प्रदान करें।",
        cold: "ठंड का मौसम - फसलों को पाले से बचाएं और पानी कम दें।",
        windy: "तेज़ हवा चलने वाली है - लंबी फसलों को सहारा दें और छिड़काव न करें।",
        default: "अपनी फसलों की नियमित जांच करें और मौसम के अनुसार खेती करें।"
      }
    };

    let condition = 'default';
    if (weatherData.precipitation > 2) condition = 'rain';
    else if (weatherData.temperature > 35) condition = 'hot';
    else if (weatherData.temperature < 10) condition = 'cold';
    else if (weatherData.windSpeed > 20) condition = 'windy';

    return {
      primaryAdvice: advice[language][condition],
      additionalTips: ["Check weather updates regularly.", "Contact local agriculture office if needed."],
      generatedAt: new Date().toISOString(),
      source: 'fallback'
    };
  }

  /**
   * Fallback alert when AI fails
   */
  getFallbackAlert(alertType, weatherData, language = 'en') {
    const alerts = {
      en: {
        heavy_rain: "Heavy rain alert! Avoid field work and ensure proper drainage.",
        strong_winds: "Strong wind alert! Secure crops and postpone spraying operations.",
        extreme_heat: "Heat wave alert! Increase irrigation and provide crop protection.",
        frost: "Frost alert! Protect sensitive crops with covering or water spray.",
        hail: "Hail storm alert! Move to safe place and protect crops if possible."
      },
      hi: {
        heavy_rain: "भारी बारिश की चेतावनी! खेत का काम बंद करें और जल निकासी सुनिश्चित करें।",
        strong_winds: "तेज़ हवा की चेतावनी! फसलों को सुरक्षित करें और छिड़काव न करें।",
        extreme_heat: "गर्मी की लहर! सिंचाई बढ़ाएं और फसलों को सुरक्षा प्रदान करें।",
        frost: "पाला चेतावनी! संवेदनशील फसलों को ढकें या पानी का छिड़काव करें।",
        hail: "ओला चेतावनी! सुरक्षित स्थान पर जाएं और फसलों की रक्षा करें।"
      }
    };

    return {
      message: alerts[language][alertType] || alerts[language]['heavy_rain'],
      urgency: 'high',
      generatedAt: new Date().toISOString(),
      source: 'fallback'
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await this.callChatAnywhereAPI({
        system: "You are a helpful assistant.",
        user: "Say 'API connection successful' in exactly 3 words."
      }, { max_tokens: 10 });

      return {
        success: true,
        message: 'ChatAnywhere API connection successful',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: `ChatAnywhere API connection failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

export default new ChatAnywhereService();
