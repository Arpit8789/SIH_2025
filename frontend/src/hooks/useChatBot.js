// hooks/useChatBot.js - FIXED VERSION (No object rendering issues)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ✅ SIMPLIFIED VERSION - First let's get it working, then add API later
const useChatBot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [isHealthy, setIsHealthy] = useState(true);
  
  // Voice-related state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  
  // Get current page from router
  const location = useLocation();
  const currentPage = location.pathname.slice(1) || 'landing';
  
  // Get user info from localStorage/context
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }, []);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setSpeechSupported(true);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chatbot when opened
  const initializeChat = useCallback(async () => {
    if (isInitialized && sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate initialization
      const newSessionId = 'session-' + Date.now();
      setSessionId(newSessionId);
      
      // Generate greeting message
      let greeting = '';
      const userName = user?.name || 'Friend';
      
      if (currentPage === 'login' || currentPage === 'register' || currentPage === 'auth') {
        greeting = `🌾 Hello! I'm Your Sahayak AI Assistant. Please login or register to access full farming features. I can still help you with general queries!`;
      } else {
        greeting = `🌾 Hello ${userName}! I'm Your Sahayak AI Assistant. Ask me anything about farming, weather, market prices, or our website features!`;
      }

      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        language: currentLanguage
      }]);
      
      // Load mock quick actions
      loadQuickActions();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to initialize chat. Please try again.');
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentLanguage, isInitialized, sessionId, user]);

  // Load quick actions based on current context
  const loadQuickActions = useCallback(() => {
    // Mock quick actions based on current page and language
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
        ]
      }
    };

    const currentActions = actions[currentLanguage]?.[currentPage] || actions['en']['landing'] || [];
    setQuickActions(currentActions);
  }, [currentPage, currentLanguage]);

  // Send message to chatbot
  const sendMessage = useCallback(async (message, isVoice = false) => {
    if (!sessionId || !message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      language: currentLanguage,
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Simulate AI response (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on message content
      let responseText = '';
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('weather')) {
        responseText = '🌤️ For weather updates and farming advice, please visit our Weather Alerts section. We provide 7-day forecasts with agricultural recommendations.';
      } else if (lowerMessage.includes('price') || lowerMessage.includes('market')) {
        responseText = '💰 Check our Market Prices section for real-time crop prices and AI-powered selling recommendations.';
      } else if (lowerMessage.includes('crop') || lowerMessage.includes('farming')) {
        responseText = '🌾 I can help with crop recommendations! Please check our Crop Advisory section for detailed guidance based on your location and soil type.';
      } else if (lowerMessage.includes('register') || lowerMessage.includes('login')) {
        responseText = '🔐 To register on Krishi Sahayak: Click Register button → Fill your details → Verify OTP → Start farming smart! Need help with any step?';
      } else {
        responseText = `🌾 Thank you for your question about "${message}". I'm Your Sahayak AI Assistant and I'm here to help with farming, weather, market prices, and platform features. Could you be more specific about what you'd like to know?`;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak response if voice was used for input
      if (isVoice && speechSupported) {
        speak(responseText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '🚫 Sorry, I encountered an error. Please try again or ask something else.',
        timestamp: new Date(),
        language: currentLanguage,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentLanguage, speechSupported]);

  // Handle quick action click
  const handleQuickAction = useCallback(async (action) => {
    if (!sessionId) return;

    const responses = {
      how_to_register: "🔐 To register on Krishi Sahayak: Click 'Register' button → Fill your details → Verify OTP → Start farming smart! Need help with any step?",
      what_is_platform: "🌾 Krishi Sahayak is India's smartest multilingual farming platform offering AI-powered crop advice, weather alerts, market prices, disease detection, and government scheme information!",
      platform_features: "📱 Key Features: 🌤️ Weather Alerts, 💰 Market Prices, 🔬 Disease Detection, 🌱 Crop Recommendations, 💊 NPK Calculator, 🏛️ Government Schemes, 🤖 Voice Assistant",
      todays_weather: "🌤️ For today's weather and farming advice, visit our Weather section. I can also help you understand weather-based farming decisions!",
      market_prices: "💰 Check real-time crop prices in our Market section. I can help you understand price trends and suggest best selling times!",
      crop_recommendations: "🌱 For personalized crop recommendations based on your soil and location, visit our Crop Advisory section!",
      disease_detection: "🔬 Upload crop photos in our Disease Detection section for AI-powered diagnosis and treatment recommendations!"
    };

    const response = responses[action.action] || "I can help you with that! Please ask me your specific question.";

    const actionMessage = {
      id: Date.now(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      language: currentLanguage,
      isQuickAction: true
    };

    setMessages(prev => [...prev, actionMessage]);
  }, [sessionId, currentLanguage]);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!speechSupported || isListening) return;
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                       currentLanguage === 'pa' ? 'pa-IN' : 'en-US';

      setIsListening(true);
      setError(null);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        
        if (transcript.trim()) {
          sendMessage(transcript, true);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      setError('Could not start voice recognition.');
    }
  }, [speechSupported, isListening, sendMessage, currentLanguage]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Speak text using speech synthesis
  const speak = useCallback((text) => {
    if (!speechSupported || !text) return;

    try {
      if (synthRef.current) {
        synthRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                       currentLanguage === 'pa' ? 'pa-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      synthRef.current = window.speechSynthesis;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  }, [speechSupported, currentLanguage]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    try {
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Change language
  const changeLanguage = useCallback((newLanguage) => {
    setCurrentLanguage(newLanguage);
    loadQuickActions();
  }, [loadQuickActions]);

  // Open chatbot
  const openChat = useCallback(() => {
    setIsOpen(true);
    if (!isInitialized) {
      initializeChat();
    }
  }, [isInitialized, initializeChat]);

  // Close chatbot
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Reset chatbot state
  const resetChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setIsInitialized(false);
    setError(null);
    setQuickActions([]);
    initializeChat();
  }, [initializeChat]);

  // Update context when page changes
  useEffect(() => {
    if (isInitialized) {
      loadQuickActions();
    }
  }, [currentPage, isInitialized, loadQuickActions]);

  return {
    // State
    isOpen,
    isLoading,
    isInitialized,
    messages,
    quickActions,
    currentLanguage,
    error,
    isHealthy,
    currentPage,
    user,
    
    // Voice state
    isListening,
    isSpeaking,
    speechSupported,
    
    // Actions
    openChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    changeLanguage,
    resetChat,
    
    // Voice actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    
    // Utility
    messagesEndRef
  };
};

export default useChatBot;
