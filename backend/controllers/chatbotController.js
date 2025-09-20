// controllers/chatbotController.js - Main Chatbot Logic
import ChatSession from '../models/ChatSession.js';
import GeminiService from '../services/geminiService.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

class ChatbotController {
  // Initialize chat session
  initializeChat = catchAsync(async (req, res, next) => {
    const { currentPage = 'landing', language = 'en' } = req.body;
    const user = req.user || null; // null for non-authenticated users
    
    // Generate unique session ID
    const sessionId = uuidv4();
    
    // Create new chat session
    const chatSession = new ChatSession({
      userId: user?.id || null,
      sessionId,
      context: {
        currentPage,
        userRole: user?.role || 'visitor',
        language,
        location: user?.location || {}
      }
    });

    await chatSession.save();

    // Initial greeting message based on page and user
    let greeting = '';
    if (currentPage === 'landing' && !user) {
      if (language === 'hi') {
        greeting = '🌾 नमस्ते! मैं कृषि सहायक का AI असिस्टेंट हूं। पूरी सुविधाओं के लिए कृपया लॉगिन या रजिस्टर करें। मैं फिर भी आपकी सामान्य मदद कर सकता हूं!';
      } else if (language === 'pa') {
        greeting = '🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ ਦਾ AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਪੂਰੀ ਸੁਵਿਧਾਵਾਂ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਲਾਗਇਨ ਜਾਂ ਰਜਿਸਟਰ ਕਰੋ। ਮੈਂ ਫਿਰ ਵੀ ਤੁਹਾਡੀ ਸਾਧਾਰਨ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ!';
      } else {
        greeting = '🌾 Hello! I\'m Krishi Sahayak AI Assistant. Please login or register to access full farming features. I can still help you with general queries!';
      }
    } else {
      const userName = user?.name || 'Friend';
      if (language === 'hi') {
        greeting = `🌾 नमस्ते ${userName}! मैं कृषि सहायक का AI असिस्टेंट हूं। खेती, मौसम, बाजार की कीमतें, या हमारी वेबसाइट के बारे में कुछ भी पूछें!`;
      } else if (language === 'pa') {
        greeting = `🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${userName}! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ ਦਾ AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਖੇਤੀ, ਮੌਸਮ, ਮਾਰਕਿਟ ਦੀਆਂ ਕੀਮਤਾਂ, ਜਾਂ ਸਾਡੀ ਵੈਬਸਾਈਟ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!`;
      } else {
        greeting = `🌾 Hello ${userName}! I'm Krishi Sahayak AI Assistant. Ask me anything about farming, weather, market prices, or our website features!`;
      }
    }

    // Add greeting as first message
    await chatSession.addMessage('assistant', greeting, language, false);

    ResponseHandler.success(res, {
      sessionId,
      greeting,
      context: chatSession.context
    }, 'Chat session initialized successfully');
  });

  // Send message to chatbot
  sendMessage = catchAsync(async (req, res, next) => {
    const { sessionId, message, language = 'en', isVoice = false } = req.body;
    
    if (!sessionId || !message) {
      return ResponseHandler.error(res, 'Session ID and message are required', 400);
    }

    // Find chat session
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    // Add user message to session
    await chatSession.addMessage('user', message, language, isVoice);

    // Get user context
    const user = req.user || null;
    const currentPage = chatSession.context.currentPage || 'landing';

    // Create system context
    const systemContext = GeminiService.createSystemContext(user, currentPage, language);

    // Get conversation history
    const conversationHistory = chatSession.getRecentMessages(10);

    // Generate AI response
    const aiResponse = await GeminiService.generateResponse(
      message, 
      systemContext, 
      conversationHistory
    );

    let botMessage = '';
    if (aiResponse.success) {
      botMessage = aiResponse.message;
    } else {
      // Use fallback response
      botMessage = aiResponse.message;
      console.error('AI Response Error:', aiResponse.error);
    }

    // Add bot response to session
    await chatSession.addMessage('assistant', botMessage, language, false);

    ResponseHandler.success(res, {
      message: botMessage,
      language,
      isVoice,
      sessionStats: {
        totalMessages: chatSession.metadata.totalMessages,
        tokensUsed: aiResponse.tokens || 0
      }
    }, 'Message processed successfully');
  });

  // Update chat context (when user navigates to different page)
  updateContext = catchAsync(async (req, res, next) => {
    const { sessionId, currentPage, language } = req.body;
    
    if (!sessionId) {
      return ResponseHandler.error(res, 'Session ID is required', 400);
    }

    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    // Update context
    await chatSession.updateContext({
      currentPage: currentPage || chatSession.context.currentPage,
      language: language || chatSession.context.language
    });

    ResponseHandler.success(res, {
      context: chatSession.context
    }, 'Context updated successfully');
  });

  // Get chat history
  getChatHistory = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    const messages = chatSession.getRecentMessages(50); // Last 50 messages

    ResponseHandler.success(res, {
      messages,
      context: chatSession.context,
      metadata: chatSession.metadata
    }, 'Chat history retrieved successfully');
  });

  // End chat session
  endSession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.body;
    
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    // Mark session as inactive
    chatSession.metadata.isActive = false;
    await chatSession.save();

    ResponseHandler.success(res, null, 'Chat session ended successfully');
  });

  // Get quick actions based on current page and user role
  getQuickActions = catchAsync(async (req, res, next) => {
    const { currentPage = 'landing', language = 'en' } = req.query;
    const user = req.user || null;

    const quickActions = this.generateQuickActions(currentPage, user?.role || 'visitor', language);

    ResponseHandler.success(res, {
      quickActions,
      currentPage,
      userRole: user?.role || 'visitor'
    }, 'Quick actions retrieved successfully');
  });

  // Generate quick action buttons based on context
  generateQuickActions(currentPage, userRole, language) {
    const actions = {
      en: {
        landing: [
          { text: "🔐 How to register?", action: "how_to_register" },
          { text: "🌾 What is Krishi Sahayak?", action: "what_is_platform" },
          { text: "📱 Available features", action: "platform_features" }
        ],
        dashboard: [
          { text: "🌤️ Today's weather", action: "todays_weather" },
          { text: "💰 Market prices", action: "market_prices" },
          { text: "🌱 Crop recommendations", action: "crop_recommendations" },
          { text: "🔬 Disease detection help", action: "disease_detection" }
        ],
        'market-prices': [
          { text: "📊 Current wheat prices", action: "wheat_prices" },
          { text: "🌾 Best selling time", action: "selling_time" },
          { text: "🤝 B2B marketplace", action: "b2b_marketplace" }
        ],
        weather: [
          { text: "🌧️ Rainfall prediction", action: "rainfall_prediction" },
          { text: "🚜 Farming advice", action: "farming_advice" },
          { text: "⚠️ Weather alerts", action: "weather_alerts" }
        ]
      },
      hi: {
        landing: [
          { text: "🔐 रजिस्टर कैसे करें?", action: "how_to_register" },
          { text: "🌾 कृषि सहायक क्या है?", action: "what_is_platform" },
          { text: "📱 उपलब्ध सुविधाएं", action: "platform_features" }
        ],
        dashboard: [
          { text: "🌤️ आज का मौसम", action: "todays_weather" },
          { text: "💰 बाजार की कीमतें", action: "market_prices" },
          { text: "🌱 फसल सुझाव", action: "crop_recommendations" },
          { text: "🔬 रोग पहचान मदद", action: "disease_detection" }
        ]
      },
      pa: {
        landing: [
          { text: "🔐 ਰਜਿਸਟਰ ਕਿਵੇਂ ਕਰੀਏ?", action: "how_to_register" },
          { text: "🌾 ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ ਕੀ ਹੈ?", action: "what_is_platform" },
          { text: "📱 ਉਪਲਬਧ ਸੁਵਿਧਾਵਾਂ", action: "platform_features" }
        ],
        dashboard: [
          { text: "🌤️ ਅੱਜ ਦਾ ਮੌਸਮ", action: "todays_weather" },
          { text: "💰 ਮਾਰਕਿਟ ਦੀਆਂ ਕੀਮਤਾਂ", action: "market_prices" },
          { text: "🌱 ਫਸਲ ਸੁਝਾਅ", action: "crop_recommendations" },
          { text: "🔬 ਰੋਗ ਪਛਾਣ ਮਦਦ", action: "disease_detection" }
        ]
      }
    };

    return actions[language]?.[currentPage] || actions['en']['landing'];
  }

  // Handle quick action clicks
  handleQuickAction = catchAsync(async (req, res, next) => {
    const { sessionId, action, language = 'en' } = req.body;
    
    const responses = {
      en: {
        how_to_register: "🔐 To register on Krishi Sahayak: Click 'Register' button → Fill your details → Verify OTP → Start farming smart! Need help with any step?",
        what_is_platform: "🌾 Krishi Sahayak is India's smartest multilingual farming platform offering AI-powered crop advice, weather alerts, market prices, disease detection, soil health guidance, and government scheme information!",
        platform_features: "📱 Key Features: 🌤️ Weather Alerts, 💰 Market Prices, 🔬 Disease Detection, 🌱 Crop Recommendations, 💊 NPK Calculator, 🏛️ Government Schemes, 🤖 Voice Assistant",
        todays_weather: "🌤️ For today's weather and farming advice, visit our Weather section. I can also help you understand weather-based farming decisions!",
        market_prices: "💰 Check real-time crop prices in our Market section. I can help you understand price trends and suggest best selling times!",
        crop_recommendations: "🌱 For personalized crop recommendations based on your soil and location, visit our Crop Advisory section!",
        disease_detection: "🔬 Upload crop photos in our Disease Detection section for AI-powered diagnosis and treatment recommendations!"
      },
      hi: {
        how_to_register: "🔐 कृषि सहायक पर रजिस्टर करने के लिए: 'रजिस्टर' बटन दबाएं → अपनी जानकारी भरें → OTP वेरिफाई करें → स्मार्ट खेती शुरू करें! किसी भी कदम में मदद चाहिए?",
        what_is_platform: "🌾 कृषि सहायक भारत का सबसे स्मार्ट बहुभाषी खेती प्लेटफॉर्म है जो AI-पावर्ड फसल सलाह, मौसम अलर्ट, बाजार की कीमतें, रोग पहचान, मिट्टी स्वास्थ्य मार्गदर्शन प्रदान करता है!",
        platform_features: "📱 मुख्य सुविधाएं: 🌤️ मौसम अलर्ट, 💰 बाजार की कीमतें, 🔬 रोग पहचान, 🌱 फसल सुझाव, 💊 NPK कैलकुलेटर, 🏛️ सरकारी योजनाएं, 🤖 आवाज सहायक"
      },
      pa: {
        how_to_register: "🔐 ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ 'ਤੇ ਰਜਿਸਟਰ ਕਰਨ ਲਈ: 'ਰਜਿਸਟਰ' ਬਟਨ ਦਬਾਓ → ਆਪਣੀ ਜਾਣਕਾਰੀ ਭਰੋ → OTP ਵੈਰੀਫਾਈ ਕਰੋ → ਸਮਾਰਟ ਖੇਤੀ ਸ਼ੁਰੂ ਕਰੋ!",
        what_is_platform: "🌾 ਕ੍ਰਿਸ਼ੀ ਸਹਾਇਕ ਭਾਰਤ ਦਾ ਸਭ ਤੋਂ ਸਮਾਰਟ ਬਹੁਭਾਸ਼ੀ ਖੇਤੀ ਪਲੇਟਫਾਰਮ ਹੈ ਜੋ AI-ਪਾਵਰਡ ਫਸਲ ਸਲਾਹ, ਮੌਸਮ ਅਲਰਟ, ਮਾਰਕਿਟ ਕੀਮਤਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ!"
      }
    };

    const response = responses[language]?.[action] || responses['en'][action] || "I can help you with that! Please ask me your specific question.";

    // If session provided, add to conversation
    if (sessionId) {
      const chatSession = await ChatSession.findOne({ sessionId });
      if (chatSession) {
        await chatSession.addMessage('assistant', response, language, false);
      }
    }

    ResponseHandler.success(res, {
      message: response,
      action,
      language
    }, 'Quick action processed successfully');
  });

  // Health check for chatbot service
  healthCheck = catchAsync(async (req, res, next) => {
    const geminiStatus = await GeminiService.healthCheck();
    
    ResponseHandler.success(res, {
      status: 'healthy',
      geminiAI: geminiStatus,
      timestamp: new Date().toISOString()
    }, 'Chatbot service is running');
  });
}

export default new ChatbotController();
