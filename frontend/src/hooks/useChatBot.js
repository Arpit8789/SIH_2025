// hooks/useChatBot.js - GENERIC AI ASSISTANT HOOK (NO MOCK DATA)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser && token) {
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

  // Check chatbot health
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/health`);
      const data = await response.json();
      setIsHealthy(data.success && data.data.geminiAI.status === 'healthy');
    } catch (error) {
      console.error('Health check failed:', error);
      setIsHealthy(false);
    }
  }, []);

  // Initialize health check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Initialize chatbot when opened
  const initializeChat = useCallback(async () => {
    if (isInitialized && sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          currentPage,
          language: currentLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.data.sessionId);
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: data.data.greeting,
          timestamp: new Date(),
          language: currentLanguage
        }]);

        // Load quick actions
        loadQuickActions();
        setIsInitialized(true);
      } else {
        throw new Error(data.message || 'Failed to initialize chat');
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to initialize chat. Please try again.');
      setIsHealthy(false);
      
      // Fallback greeting
      const fallbackGreeting = user 
        ? `🤖 Hello ${user.name}! I'm your AI assistant. Ask me anything you'd like to know!`
        : `🤖 Hello! I'm your AI assistant. Ask me anything you'd like to know!`;

      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: fallbackGreeting,
        timestamp: new Date(),
        language: currentLanguage,
        isError: false
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentLanguage, isInitialized, sessionId, user]);

  // Load quick actions based on current context
  const loadQuickActions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/quick-actions?currentPage=${currentPage}&language=${currentLanguage}`, {
        headers: {
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        }
      });

      const data = await response.json();
      if (data.success) {
        setQuickActions(data.data.quickActions || []);
      }
    } catch (error) {
      console.error('Failed to load quick actions:', error);
      // Fallback generic actions
      const fallbackActions = [
        { text: "🌾 Help with farming", action: "farming_help" },
        { text: "🤔 General questions", action: "general_help" },
        { text: "💡 Get suggestions", action: "suggestions" }
      ];
      setQuickActions(fallbackActions);
    }
  }, [currentPage, currentLanguage, user]);

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
      const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          sessionId,
          message: message.trim(),
          language: currentLanguage,
          isVoice
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
          language: currentLanguage,
          tokens: data.data.sessionStats?.tokensUsed
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Speak response if voice was used for input
        if (isVoice && speechSupported) {
          speak(data.data.message);
        }
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '🤖 I apologize, but I\'m having trouble right now. Please try asking your question again, or ask me something else!',
        timestamp: new Date(),
        language: currentLanguage,
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentLanguage, speechSupported, user]);

  // Handle quick action click
  const handleQuickAction = useCallback(async (action) => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/quick-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          sessionId,
          action: action.action,
          language: currentLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        const actionMessage = {
          id: Date.now(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
          language: currentLanguage,
          isQuickAction: true
        };

        setMessages(prev => [...prev, actionMessage]);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
      // Fallback response
      const fallbackResponse = "I can help you with that! Please ask me your specific question.";
      
      const actionMessage = {
        id: Date.now(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
        language: currentLanguage,
        isQuickAction: true
      };

      setMessages(prev => [...prev, actionMessage]);
    }
  }, [sessionId, currentLanguage, user]);

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
