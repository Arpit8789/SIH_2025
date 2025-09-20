// components/chatbot/ChatWindow.jsx - COMPLETE MESSAGING INTERFACE
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Paperclip, Smile, MoreVertical } from 'lucide-react';
import Message from './Message';
import QuickActions from './QuickActions';
import VoiceControls from './VoiceControls';

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
        hi: 'अपना कृषि सवाल यहाँ लिखें...',
        pa: 'ਆਪਣਾ ਖੇਤੀ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ...',
        en: 'Ask me anything about farming...'
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
      }
    };
    return texts[key]?.[currentLanguage] || texts[key]?.en || '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* Welcome Message if no messages */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {currentLanguage === 'hi' ? 'नमस्ते किसान!' :
               currentLanguage === 'pa' ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ!' :
               'Hello Farmer!'}
            </h3>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              {currentLanguage === 'hi' ? 'मैं आपका AI कृषि सहायक हूँ। फसल, मौसम, बाजार की कीमत या सरकारी योजनाओं के बारे में पूछें।' :
               currentLanguage === 'pa' ? 'ਮੈਂ ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ। ਫਸਲ, ਮੌਸਮ, ਮਾਰਕੀਟ ਦੀਆਂ ਕੀਮਤਾਂ ਜਾਂ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਬਾਰੇ ਪੁੱਛੋ।' :
               'I\'m your AI farming assistant. Ask me about crops, weather, market prices, or government schemes.'}
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
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-5 h-5 text-white">🤖</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          {/* Voice Input Button */}
          {speechSupported && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isLoading}
              className={`p-3 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } disabled:opacity-50`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getText('placeholder')}
              disabled={isLoading}
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-32"
              rows="1"
              style={{
                resize: 'none',
                overflow: 'hidden',
                height: 'auto',
                minHeight: '48px'
              }}
              onInput={(e) => {
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                // You can add emoji picker here
                const emojis = ['🌾', '🚜', '🌱', '🌽', '🍅', '🥕', '🌿', '☀️', '🌧️', '💧'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                setInputMessage(prev => prev + randomEmoji);
                inputRef.current?.focus();
              }}
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-full transition-all duration-200 ${
              inputMessage.trim() && !isLoading
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={getText('send')}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Input Footer */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
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
          <div className="text-right">
            <span>Press Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
