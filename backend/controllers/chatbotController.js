// controllers/chatbotController.js - GENERIC HELPFUL CHATBOT
import ChatSession from '../models/ChatSession.js';
import GeminiService from '../services/geminiService.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

class ChatbotController {
  // Initialize chat session
  initializeChat = catchAsync(async (req, res, next) => {
    const { currentPage = 'landing', language = 'en' } = req.body;
    const user = req.user || null;
    
    const sessionId = uuidv4();
    
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

    // ✅ FIXED: More generic, less promotional greetings
    let greeting = '';
    const userName = user?.name || 'there';
    
    if (language === 'hi') {
      greeting = `🌾 नमस्ते ${userName}! मैं आपका AI सहायक हूं। खेती, मौसम, फसल, या कोई भी सवाल पूछें - मैं मदद करूंगा!`;
    } else if (language === 'pa') {
      greeting = `🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${userName}! ਮੈਂ ਤੁਹਾਡਾ AI ਸਹਾਇਕ ਹਾਂ। ਖੇਤੀ, ਮੌਸਮ, ਫਸਲਾਂ, ਜਾਂ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ!`;
    } else {
      greeting = `🌾 Hello ${userName}! I'm your AI farming assistant. Ask me anything about agriculture, weather, crops, soil, pests, or any other questions you have!`;
    }

    await chatSession.addMessage('assistant', greeting, language, false);

    ResponseHandler.success(res, {
      sessionId,
      greeting,
      context: chatSession.context
    }, 'Chat session initialized successfully');
  });

  // ✅ REST OF THE CONTROLLER REMAINS THE SAME
  sendMessage = catchAsync(async (req, res, next) => {
    const { sessionId, message, language = 'en', isVoice = false } = req.body;
    
    if (!sessionId || !message) {
      return ResponseHandler.error(res, 'Session ID and message are required', 400);
    }

    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    await chatSession.addMessage('user', message, language, isVoice);

    const user = req.user || null;
    const currentPage = chatSession.context.currentPage || 'landing';

    const systemContext = GeminiService.createSystemContext(user, currentPage, language);
    const conversationHistory = chatSession.getRecentMessages(10);

    const aiResponse = await GeminiService.generateResponse(
      message, 
      systemContext, 
      conversationHistory
    );

    let botMessage = '';
    if (aiResponse.success) {
      botMessage = aiResponse.message;
    } else {
      botMessage = aiResponse.message;
      console.error('AI Response Error:', aiResponse.error);
    }

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

  // ✅ UPDATED: Less promotional quick actions
  generateQuickActions(currentPage, userRole, language) {
    const actions = {
      en: {
        landing: [
          { text: "🌾 Help with crop selection", action: "crop_selection" },
          { text: "🌤️ Weather and farming tips", action: "weather_farming" },
          { text: "💡 General farming advice", action: "farming_advice" }
        ],
        dashboard: [
          { text: "🌱 Best crops for this season", action: "seasonal_crops" },
          { text: "🐛 Pest control advice", action: "pest_control" },
          { text: "💧 Irrigation guidance", action: "irrigation_help" },
          { text: "🌾 Soil improvement tips", action: "soil_improvement" }
        ],
        weather: [
          { text: "🌧️ Rain-based farming tips", action: "rain_farming" },
          { text: "☀️ Hot weather crop care", action: "hot_weather_care" },
          { text: "❄️ Cold protection methods", action: "cold_protection" }
        ]
      },
      hi: {
        landing: [
          { text: "🌾 फसल चुनने में मदद", action: "crop_selection" },
          { text: "🌤️ मौसम और खेती सुझाव", action: "weather_farming" },
          { text: "💡 सामान्य खेती सलाह", action: "farming_advice" }
        ],
        dashboard: [
          { text: "🌱 इस मौसम की बेहतरीन फसल", action: "seasonal_crops" },
          { text: "🐛 कीट नियंत्रण सलाह", action: "pest_control" },
          { text: "💧 सिंचाई मार्गदर्शन", action: "irrigation_help" }
        ]
      }
    };

    return actions[language]?.[currentPage] || actions['en']['landing'];
  }

  // ✅ UPDATED: More helpful quick action responses
  handleQuickAction = catchAsync(async (req, res, next) => {
    const { sessionId, action, language = 'en' } = req.body;
    
    const responses = {
      en: {
        crop_selection: "🌾 Great! I can help you choose the right crops. What's your location, season, and soil type? Also, are you looking for food crops, cash crops, or both?",
        weather_farming: "🌤️ Weather planning is crucial! What's your current weather situation? I can suggest activities for sunny, rainy, or changing weather conditions.",
        farming_advice: "💡 I'm here to help with any farming questions! Are you a beginner or experienced farmer? What specific area do you need guidance on?",
        seasonal_crops: "🌱 Perfect! What season are you planning for, and what's your location? Different regions have different optimal crops for each season.",
        pest_control: "🐛 Pest management is important! What crop are you growing and what pest problem are you seeing? I can suggest both organic and conventional solutions.",
        irrigation_help: "💧 Smart irrigation saves water and improves yield! What's your farm size, crop type, and water source? I can recommend the best irrigation method.",
        soil_improvement: "🌾 Healthy soil = healthy crops! What's your current soil condition? I can help with soil testing interpretation and improvement strategies."
      },
      hi: {
        crop_selection: "🌾 बेहतरीन! मैं फसल चुनने में मदद कर सकता हूं। आपका स्थान, मौसम और मिट्टी का प्रकार क्या है? खाद्य फसल या नकदी फसल चाहिए?",
        weather_farming: "🌤️ मौसम योजना बहुत जरूरी है! आपका वर्तमान मौसम कैसा है? मैं धूप, बारिश या बदलते मौसम के लिए सुझाव दे सकता हूं।",
        farming_advice: "💡 मैं किसी भी खेती के सवाल में मदद कर सकता हूं! आप नए किसान हैं या अनुभवी? किस विषय में मार्गदर्शन चाहिए?"
      }
    };

    const response = responses[language]?.[action] || responses['en'][action] || "I'm here to help! What specific question do you have?";

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

  // REST OF THE METHODS REMAIN THE SAME...
  updateContext = catchAsync(async (req, res, next) => {
    const { sessionId, currentPage, language } = req.body;
    
    if (!sessionId) {
      return ResponseHandler.error(res, 'Session ID is required', 400);
    }

    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    await chatSession.updateContext({
      currentPage: currentPage || chatSession.context.currentPage,
      language: language || chatSession.context.language
    });

    ResponseHandler.success(res, {
      context: chatSession.context
    }, 'Context updated successfully');
  });

  getChatHistory = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    const messages = chatSession.getRecentMessages(50);

    ResponseHandler.success(res, {
      messages,
      context: chatSession.context,
      metadata: chatSession.metadata
    }, 'Chat history retrieved successfully');
  });

  endSession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.body;
    
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      return ResponseHandler.error(res, 'Chat session not found', 404);
    }

    chatSession.metadata.isActive = false;
    await chatSession.save();

    ResponseHandler.success(res, null, 'Chat session ended successfully');
  });

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
