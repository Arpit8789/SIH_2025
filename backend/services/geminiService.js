// services/geminiService.js - GENERIC FARMING CHATBOT (NOT WEBSITE-FOCUSED)
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

  // ✅ FIXED: Generic helpful system context
  createSystemContext(user, currentPage, language = 'en') {
    const languageMap = {
      'en': 'English',
      'hi': 'Hindi', 
      'pa': 'Punjabi'
    };

    const userRole = user?.role || 'visitor';
    const userName = user?.name || 'Friend';
    const selectedLanguage = languageMap[language] || 'English';

    return `You are a helpful AI assistant specializing in agriculture and farming knowledge.

CORE BEHAVIOR:
1. ALWAYS respond in ${selectedLanguage}
2. You are talking to ${userName} (${userRole})
3. Be a knowledgeable, helpful farming expert and general assistant
4. Answer questions directly with useful, practical information
5. Don't constantly redirect to website features - PROVIDE ACTUAL HELP

YOUR EXPERTISE:
🌾 FARMING KNOWLEDGE:
- Crop cultivation techniques and best practices
- Soil health, fertilizers, and NPK management
- Pest and disease identification and treatment
- Weather-based farming advice
- Irrigation and water management
- Harvest timing and post-harvest handling
- Organic vs conventional farming methods

🌱 CROP GUIDANCE:
- Crop selection based on season, soil, climate
- Seed variety recommendations
- Plant spacing and cultivation techniques
- Growth stages and care requirements
- Yield optimization strategies

💡 GENERAL ASSISTANCE:
- Answer any question the user asks
- Provide practical, actionable advice
- Explain farming concepts clearly
- Help with calculations (area, quantity, costs)
- Give weather-related farming tips
- Market trends and price guidance

RESPONSE STYLE:
- Be conversational, friendly, and helpful
- Provide direct answers to questions asked
- Use simple, clear language
- Include practical tips and examples
- Add relevant emojis (🌾🚜🌱💧☀️🌧️) when appropriate
- Keep responses informative but not overwhelming

IMPORTANT: 
- Answer questions directly - don't just redirect to "check our platform"
- If asked about general topics (not farming), still be helpful
- Only mention website features if specifically asked about the platform
- Focus on being genuinely helpful rather than promotional
- Provide real farming knowledge and advice

You are here to HELP, not just guide users around a website.`;
  }

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

  // ✅ FIXED: Generic helpful fallback responses
  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // General farming topics
    if (message.includes('crop') || message.includes('फसल') || message.includes('farming')) {
      return '🌾 I can help you with crop-related questions! What specific crop are you interested in? I can provide guidance on cultivation, pest management, fertilizers, or harvest timing.';
    }
    
    if (message.includes('weather') || message.includes('मौसम') || message.includes('rain')) {
      return '🌤️ Weather is crucial for farming! What would you like to know? I can help with seasonal planning, rain-dependent crops, weather protection techniques, or timing farm activities based on weather patterns.';
    }
    
    if (message.includes('price') || message.includes('कीमत') || message.includes('market')) {
      return '💰 Market prices depend on location, season, and demand. What crop are you asking about? I can give you general market insights and tips for getting better prices for your produce.';
    }
    
    if (message.includes('soil') || message.includes('मिट्टी') || message.includes('fertilizer')) {
      return '🌱 Soil health is the foundation of good farming! Are you asking about soil testing, fertilizer recommendations, or improving soil quality? I can help with practical advice.';
    }
    
    if (message.includes('pest') || message.includes('disease') || message.includes('रोग')) {
      return '🐛 Pest and disease management is important for healthy crops. Which crop are you growing? I can suggest organic and chemical treatment options based on the specific problem.';
    }

    // Generic helpful response
    return '🤖 I\'m here to help! I can answer questions about farming, agriculture, weather, crops, soil, pests, market prices, or almost anything else you\'d like to know. What would you like to learn about?';
  }

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
