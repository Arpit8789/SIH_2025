// services/geminiService.js - Gemini API Integration (MODEL FIXED)
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized && this.model) {
      return true;
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found');
        return false;
      }
      
      console.log('🔑 Initializing Gemini AI...');
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // ✅ Try different model names until one works
      const modelNames = [
        process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',  
        'gemini-2.0-flash-exp',
        'gemini-pro'
      ];
      
      let modelWorking = false;
      
      for (const modelName of modelNames) {
        try {
          console.log(`🔄 Trying model: ${modelName}`);
          this.model = this.genAI.getGenerativeModel({ model: modelName });
          
          // Test the model
          const testResult = await this.model.generateContent('Hello');
          const testResponse = await testResult.response;
          const testText = testResponse.text();
          
          if (testText && testText.trim()) {
            console.log(`✅ Model ${modelName} is working!`);
            modelWorking = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Model ${modelName} failed: ${error.message}`);
          continue;
        }
      }
      
      if (!modelWorking) {
        throw new Error('No working Gemini model found');
      }
      
      this.isInitialized = true;
      console.log('✅ Gemini AI initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.genAI = null;
      this.model = null;
      this.isInitialized = false;
      return false;
    }
  }

  // Create system context (same as before)
  createSystemContext(user, currentPage, language = 'en') {
    const languageMap = {
      'en': 'English',
      'hi': 'Hindi', 
      'pa': 'Punjabi'
    };

    const userRole = user?.role || 'visitor';
    const userName = user?.name || 'Friend';
    const selectedLanguage = languageMap[language] || 'English';

    return `You are Krishi Sahayak AI Assistant - India's most advanced multilingual farming platform.

CRITICAL INSTRUCTIONS:
1. ALWAYS respond in ${selectedLanguage}. If user writes in Hindi, respond in Hindi. If Punjabi, respond in Punjabi.
2. You are helping ${userName} (Role: ${userRole}) who is currently on ${currentPage} page.

PLATFORM KNOWLEDGE - Krishi Sahayak Features:
🌾 CORE FEATURES:
- Multilingual Advisory (Hindi/English/Punjabi with voice support)
- Location-specific crop recommendations with GPS
- Advanced soil health & NPK calculator with fertilizer guidance
- Weather-based alerts & 7-day agricultural forecasts
- AI-powered pest/disease detection via camera
- Real-time market prices with AI sell/hold recommendations
- Government schemes & subsidy advisory with eligibility checking
- B2B marketplace for direct farmer-to-buyer sales

🤖 YOUR CAPABILITIES:
- Answer farming questions (crop selection, fertilizers, pest control)
- Explain website features and navigation
- Provide weather-based farming advice
- Help with market price queries and selling decisions
- Guide through government scheme applications
- Assist with soil health and fertilizer calculations
- Disease identification advice
- Voice commands and multilingual conversations

SPECIAL BEHAVIORS:
- If user is on 'landing' page and not logged in: Encourage them to "register or login to access full farming features"
- For farming questions: Provide scientific, location-aware advice
- For website help: Guide them to relevant features
- Always be helpful, practical, and farmer-focused

RESPONSE STYLE:
- Be conversational and friendly
- Use farming terminology appropriately
- Include emojis relevant to farming (🌾🚜🌱💧☀️🌧️)
- Keep responses concise but informative
- Offer to help with related features when relevant

Remember: You're helping Indian farmers make better decisions. Be accurate, practical, and supportive.`;
  }

  // Generate response using Gemini (same logic as before)
  async generateResponse(userMessage, systemContext, conversationHistory = []) {
    try {
      const initialized = await this.initialize();
      if (!initialized || !this.model) {
        return {
          success: false,
          message: this.getFallbackResponse(userMessage),
          error: 'Gemini AI not initialized'
        };
      }

      let conversationPrompt = systemContext + '\n\nConversation History:\n';
      
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        conversationPrompt += `${msg.role}: ${msg.content}\n`;
      });
      
      conversationPrompt += `\nUser: ${userMessage}\nAssistant:`;

      console.log('🤖 Sending request to Gemini AI...');

      const result = await this.model.generateContent(conversationPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini AI response received');

      return {
        success: true,
        message: text.trim(),
        tokens: text.length
      };
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      return {
        success: false,
        message: this.getFallbackResponse(userMessage),
        error: error.message
      };
    }
  }

  // Fallback responses (same as before)
  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('crop') || message.includes('फसल')) {
      return '🌾 I can help with crop recommendations! Please check our Crop Advisory section for detailed guidance based on your location and soil type.';
    }
    
    if (message.includes('weather') || message.includes('मौसम')) {
      return '🌤️ For weather updates and farming advice, please visit our Weather Alerts section. We provide 7-day forecasts with agricultural recommendations.';
    }
    
    if (message.includes('price') || message.includes('कीमत')) {
      return '💰 Check our Market Prices section for real-time crop prices and AI-powered selling recommendations.';
    }
    
    return '🌾 I apologize, I\'m currently experiencing technical difficulties. However, I can still help you navigate Krishi Sahayak platform! Try asking about our features like Market Prices, Weather Alerts, Disease Detection, or Soil Health guidance.';
  }

  // Health check
  async healthCheck() {
    try {
      const initialized = await this.initialize();
      
      if (!initialized || !this.model) {
        return { 
          status: 'unhealthy', 
          message: 'Failed to initialize Gemini AI - check API key and model availability' 
        };
      }

      return { 
        status: 'healthy', 
        message: 'Gemini AI is working correctly',
        initialized: this.isInitialized
      };
    } catch (error) {
      console.error('❌ Gemini health check failed:', error);
      return { 
        status: 'unhealthy', 
        message: `Health check failed: ${error.message}`,
        initialized: this.isInitialized
      };
    }
  }
}

export default new GeminiService();
