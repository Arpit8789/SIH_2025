// components/chatbot/ChatWindow.jsx - GENERIC AI ASSISTANT WINDOW
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Smile } from 'lucide-react';
import Message from './Message';
import QuickActions from './QuickActions';

const ChatWindow = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  quickActions = [],
  onQuickAction,
  currentLanguage = 'en',
  messagesEndRef,
  // Voice features
  speechSupported = false,
  isListening = false,
  isSpeaking = false,
  onStartListening,
  onStopListening,
  onSpeak,
  onStopSpeaking
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const inputRef = useRef(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle send message
  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (message && onSendMessage) {
      onSendMessage(message, false);
      setInputMessage('');
      setShowQuickActions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle quick action
  const handleQuickActionClick = (action) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
    setShowQuickActions(false);
  };

  // Language-specific texts
  const getText = (key) => {
    const texts = {
      placeholder: {
        hi: 'कुछ भी पूछें...',
        pa: 'ਕੁਝ ਵੀ ਪੁੱਛੋ...',
        en: 'Ask me anything...'
      },
      send: {
        hi: 'भेजें',
        pa: 'ਭੇਜੋ',
        en: 'Send'
      },
      typing: {
        hi: 'टाइप कर रहा है...',
        pa: 'ਟਾਈਪ ਕਰ ਰਿਹਾ ਹੈ...',
        en: 'Typing...'
      },
      welcome_title: {
        hi: 'नमस्ते! मैं आपका AI असिस्टेंट हूं',
        pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਅਸਿਸਟੈਂਟ ਹਾਂ',
        en: 'Hello! I\'m your AI Assistant'
      },
      welcome_desc: {
        hi: 'मैं आपकी किसी भी चीज़ में मदद कर सकता हूं। कृषि, मौसम, सामान्य प्रश्न, या कुछ भी पूछें जो आप जानना चाहते हैं।',
        pa: 'ਮੈਂ ਤੁਹਾਡੀ ਕਿਸੇ ਵੀ ਚੀਜ਼ ਵਿਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਖੇਤੀ, ਮੌਸਮ, ਆਮ ਸਵਾਲ, ਜਾਂ ਜੋ ਵੀ ਤੁਸੀਂ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ।',
        en: 'I can help you with anything! Ask about farming, weather, general questions, or anything you\'d like to know.'
      }
    };
    return texts[key]?.[currentLanguage] || texts[key]?.en || '';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* MESSAGES AREA - PROPER SCROLLING */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 scroll-smooth">
        {/* ✅ GENERIC WELCOME MESSAGE */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4 md:py-8"
          >
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🤖</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
              {getText('welcome_title')}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
              {getText('welcome_desc')}
            </p>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <Message
            key={message.id || index}
            message={message}
            index={index}
            speechSupported={speechSupported}
            isSpeaking={isSpeaking && message.role === 'assistant'}
            onSpeak={onSpeak}
            onStopSpeaking={onStopSpeaking}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-4 h-4 md:w-5 md:h-5 text-white">🤖</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 md:px-4 py-2 md:py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{getText('typing')}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages end ref for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <QuickActions
          actions={quickActions}
          onActionClick={handleQuickActionClick}
          onClose={() => setShowQuickActions(false)}
          currentLanguage={currentLanguage}
        />
      )}

      {/* ✅ INPUT AREA - KEEP YOUR DESIGN */}
      <div className="p-2 md:p-4 bg-white flex-shrink-0 dark:bg-black">
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Voice Input Button */}
          {speechSupported && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isLoading}
              className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg animate-pulse'
                  : 'bg-gray-200 hover:bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-white'
              } disabled:opacity-50`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </motion.button>
          )}

          {/* ✅ TEXT INPUT - KEEP YOUR DESIGN */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getText('placeholder')}
              disabled={isLoading}
              className="w-full resize-none border border-gray-300 rounded-2xl px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base
                         dark:text-white bg-white placeholder-gray-500
                          dark:bg-black dark:placeholder-gray-500 justify-center items-center"
              rows="1"
              style={{
                resize: 'none',
                overflow: 'hidden',
                height: 'auto',
                minHeight: '40px',
                maxHeight: '80px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                const emojis = ['🤖', '💡', '❓', '👍', '🌟', '💭', '🔍', '📚', '🎯', '✨'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                setInputMessage(prev => prev + randomEmoji);
                inputRef.current?.focus();
              }}
            >
              <Smile className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
              inputMessage.trim() && !isLoading
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                : 'bg-gray-300 text-gray-800 dark:bg-gray-900 dark:text-white cursor-not-allowed'
            }`}
            title={getText('send')}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>

        {/* MOBILE-FRIENDLY INPUT FOOTER */}
        <div className="hidden md:flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {isListening && (
              <span className="flex items-center space-x-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center space-x-1 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Speaking...</span>
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-gray-400">
          <span>Press Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
