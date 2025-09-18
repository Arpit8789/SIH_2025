// src/pages/features/AIChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Bot, 
  User, 
  Sparkles,
  MessageSquare,
  Lightbulb,
  Wheat,
  Cloud,
  TrendingUp,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/services/aiService';
import { dateHelpers } from '@/utils/helpers';

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  
  const messagesEndRef = useRef(null);
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    initializeChat();
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: t('chat.welcomeMessage', { 
        name: user?.name || t('common.farmer'),
        defaultValue: `Namaste! I'm your AI farming assistant. I can help you with crop advice, weather insights, market prices, and disease solutions in Hindi, English, and Punjabi. How can I help you today?` 
      }),
      timestamp: new Date().toISOString(),
      language: currentLanguage
    };

    setMessages([welcomeMessage]);
    loadSuggestedQuestions();
  };

  const loadSuggestedQuestions = () => {
    const questions = [
      { 
        icon: '🌾', 
        text: t('chat.suggestedQuestion1', { defaultValue: 'What crop should I plant this season?' }),
        category: 'crops'
      },
      { 
        icon: '🌧️', 
        text: t('chat.suggestedQuestion2', { defaultValue: 'Will it rain this week?' }),
        category: 'weather'
      },
      { 
        icon: '💰', 
        text: t('chat.suggestedQuestion3', { defaultValue: 'What are today\'s wheat prices?' }),
        category: 'market'
      },
      { 
        icon: '🐛', 
        text: t('chat.suggestedQuestion4', { defaultValue: 'My crop leaves are turning yellow, what should I do?' }),
        category: 'disease'
      },
      { 
        icon: '💧', 
        text: t('chat.suggestedQuestion5', { defaultValue: 'How often should I water my tomatoes?' }),
        category: 'irrigation'
      },
      { 
        icon: '🌱', 
        text: t('chat.suggestedQuestion6', { defaultValue: 'Best fertilizer for better yield?' }),
        category: 'fertilizer'
      }
    ];
    
    setSuggestedQuestions(questions);
  };

  const loadChatHistory = async () => {
    try {
      const response = await aiService.getChatHistory({
        userId: user?.id,
        limit: 10
      });
      
      if (response.success) {
        setChatHistory(response.data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call AI chatbot API
      const response = await aiService.sendChatMessage({
        message: text,
        userId: user?.id,
        language: currentLanguage,
        context: {
          userRole: user?.role,
          location: user?.location,
          previousMessages: messages.slice(-5) // Send last 5 messages for context
        }
      });

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          language: currentLanguage,
          suggestions: response.data.suggestions || [],
          actions: response.data.actions || [],
          confidence: response.data.confidence || 100
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update suggested questions based on context
        if (response.data.suggestedQuestions) {
          setSuggestedQuestions(response.data.suggestedQuestions);
        }
      } else {
        throw new Error(response.message || 'AI response failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: t('chat.errorMessage', { 
          defaultValue: 'Sorry, I encountered an error. Please try asking your question again.' 
        }),
        timestamp: new Date().toISOString(),
        language: currentLanguage,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputMessage(transcript);
    sendMessage(transcript);
  };

  const handleSuggestedClick = (question) => {
    sendMessage(question.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const rateMessage = async (messageId, rating) => {
    try {
      await aiService.rateMessage({
        messageId,
        userId: user?.id,
        rating
      });
    } catch (error) {
      console.error('Failed to rate message:', error);
    }
  };

  const speakMessage = (content) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                      currentLanguage === 'pa' ? 'pa-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🤖 {t('chat.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('chat.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-3 py-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t('chat.aiPowered')}
          </Badge>
          <Button variant="outline" onClick={clearChat}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('chat.newChat')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t('chat.conversation')}
                <Badge variant="outline" className="ml-auto">
                  {messages.filter(m => m.type === 'user').length} {t('chat.messages')}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="w-8 h-8 bg-gradient-ag rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : message.isError
                            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          
                          {/* AI Message Actions */}
                          {message.type === 'ai' && !message.isError && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => speakMessage(message.content)}
                              >
                                <Volume2 className="h-3 w-3 mr-1" />
                                {t('chat.listen')}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {t('chat.copy')}
                              </Button>
                              
                              <div className="flex gap-1 ml-auto">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => rateMessage(message.id, 'positive')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => rateMessage(message.id, 'negative')}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Action Suggestions */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-border/50">
                              <div className="flex flex-wrap gap-2">
                                {message.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => action.onClick && action.onClick()}
                                  >
                                    {action.icon && <span className="mr-1">{action.icon}</span>}
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {dateHelpers.formatTime(message.timestamp)}
                          {message.confidence && message.confidence < 90 && (
                            <span className="ml-2">
                              ({message.confidence}% {t('chat.confidence')})
                            </span>
                          )}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 order-2">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-ag rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-muted-foreground">
                            {t('chat.thinking')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('chat.inputPlaceholder')}
                      disabled={isLoading}
                      className="pr-12"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <VoiceButton
                        mode="listen"
                        onTranscript={handleVoiceInput}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-primary" />
                {t('chat.suggestedQuestions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-3"
                  onClick={() => handleSuggestedClick(question)}
                >
                  <span className="text-lg mr-2">{question.icon}</span>
                  <span className="text-sm">{question.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('chat.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <Wheat className="mr-2 h-4 w-4" />
                {t('chat.checkCropPrices')}
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Cloud className="mr-2 h-4 w-4" />
                {t('chat.getWeatherUpdate')}
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('chat.marketAnalysis')}
              </Button>
            </CardContent>
          </Card>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('chat.recentChats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chatHistory.map((session, index) => (
                  <div key={index} className="p-2 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                    <p className="font-medium text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateHelpers.formatRelativeTime(session.lastMessage)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('chat.capabilities')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="w-3 h-3 p-0"></Badge>
                <span>{t('chat.capability1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="w-3 h-3 p-0"></Badge>
                <span>{t('chat.capability2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="w-3 h-3 p-0"></Badge>
                <span>{t('chat.capability3')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="w-3 h-3 p-0"></Badge>
                <span>{t('chat.capability4')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
