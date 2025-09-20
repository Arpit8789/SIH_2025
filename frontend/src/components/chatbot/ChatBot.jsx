// components/chatbot/ChatBot.jsx - BIG CLICKABLE BUTTON VERSION
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, WifiOff, Bot, Sparkles, Minimize2, RotateCcw } from 'lucide-react';
import ChatWindow from './ChatWindow';
import useChatBot from '../../hooks/useChatBot';

const ChatBot = () => {
  const {
    isOpen,
    isLoading,
    isHealthy,
    error,
    currentLanguage,
    openChat,
    closeChat,
    messages,
    sendMessage,
    quickActions,
    handleQuickAction,
    changeLanguage,
    resetChat,
    isListening,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    messagesEndRef
  } = useChatBot();

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  // Handle opening chat
  const handleOpenChat = (e) => {
    console.log('🚀 CHATBOT CLICKED!');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof openChat === 'function') {
      openChat();
    }
  };

  // Handle closing chat
  const handleCloseChat = () => {
    if (typeof closeChat === 'function') {
      closeChat();
    }
  };

  return (
    <>
      {/* BIG FLOATING CHATBOT BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* MUCH LARGER CLICKABLE AREA */}
            <div 
              onClick={handleOpenChat}
              onMouseDown={handleOpenChat}
              onTouchStart={handleOpenChat}
              className="relative group cursor-pointer select-none"
            >
              {/* Health Status Indicator */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-3 border-white ${
                isHealthy ? 'bg-green-500' : 'bg-red-500'
              } flex items-center justify-center z-10 shadow-lg`}>
                {isHealthy ? (
                  <Wifi className="w-3 h-3 text-white" />
                ) : (
                  <WifiOff className="w-3 h-3 text-white" />
                )}
              </div>

              {/* MAIN BIG BUTTON - 30% LARGER */}
              <motion.button
                whileHover={{ 
                  scale: 1.15, 
                  y: -4,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenChat}
                onMouseDown={handleOpenChat}
                onTouchStart={handleOpenChat}
                className={`
                  relative w-28 h-28 rounded-3xl shadow-2xl flex flex-col items-center justify-center
                  transition-all duration-300 transform hover:shadow-3xl overflow-hidden
                  active:scale-95 cursor-pointer select-none
                  ${isHealthy 
                    ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700' 
                    : 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
                  }
                `}
                title="Chat with Your Farming Assistant"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                
                {/* Icon and Text - BIGGER */}
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <div className="flex items-center mb-1">
                    <Bot className="w-8 h-8 text-white mr-1" />
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="text-sm font-bold text-white leading-tight text-center">
                    <div>Your</div>
                    <div>Sahayak</div>
                  </div>
                </div>

                {/* Enhanced Shimmer effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "linear",
                    repeatDelay: 3
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full transform -skew-x-12"
                />
              </motion.button>

              {/* Enhanced Pulse animations */}
              {isHealthy && (
                <>
                  <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-green-500 animate-ping opacity-20"></div>
                  <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-green-400 animate-pulse opacity-30"></div>
                </>
              )}

              {/* BIGGER Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-3 -left-3 bg-yellow-400 text-yellow-900 text-sm px-3 py-1.5 rounded-full font-bold shadow-lg pointer-events-none"
              >
                AI
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-3 -left-4 bg-blue-500 text-white text-sm px-3 py-1.5 rounded-full font-bold shadow-lg pointer-events-none"
              >
                24/7
              </motion.div>

              {/* Invisible larger click area for better touch targets */}
              <div 
                className="absolute -inset-6 cursor-pointer"
                onClick={handleOpenChat}
                onMouseDown={handleOpenChat}
                onTouchStart={handleOpenChat}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT WINDOW - ALSO BIGGER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* BIGGER CHAT WINDOW */}
            <div className="w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden backdrop-blur-sm">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-5 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Enhanced AI Avatar - BIGGER */}
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <div className="flex items-center">
                        <Bot className="w-7 h-7 text-white mr-1" />
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-xl">Your Sahayak</h3>
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
                        <span className="text-base">{isHealthy ? 'Ready to Help' : 'Connection Issues'}</span>
                        {isListening && (
                          <span className="text-xs bg-red-500/30 px-2 py-1 rounded-full border border-red-300/50">
                            🎤 Listening...
                          </span>
                        )}
                        {isSpeaking && (
                          <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full border border-blue-300/50">
                            🔊 Speaking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Language Selector - BIGGER */}
                    <select 
                      value={currentLanguage || 'en'}
                      onChange={(e) => {
                        if (typeof changeLanguage === 'function') {
                          changeLanguage(e.target.value);
                        }
                      }}
                      className="bg-white/20 text-white text-sm rounded-lg px-4 py-2 border border-white/30 outline-none backdrop-blur-sm"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-800 bg-white">
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>

                    {/* Reset Button - BIGGER */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (typeof resetChat === 'function') {
                          resetChat();
                        }
                      }}
                      className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm"
                      title="Reset Chat"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>

                    {/* Close Button - BIGGER */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseChat}
                      className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm"
                      title="Close Chat"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-red-500/20 border border-red-300/50 rounded-lg p-3 flex items-center space-x-2 text-sm backdrop-blur-sm"
                  >
                    <div className="w-4 h-4 text-red-200 flex-shrink-0">⚠️</div>
                    <span className="text-red-100">{String(error)}</span>
                  </motion.div>
                )}
              </div>

              {/* Chat Content */}
              <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-50 to-white">
                <ChatWindow
                  messages={messages || []}
                  isLoading={isLoading || false}
                  onSendMessage={sendMessage}
                  quickActions={quickActions || []}
                  onQuickAction={handleQuickAction}
                  currentLanguage={currentLanguage || 'en'}
                  messagesEndRef={messagesEndRef}
                  // Voice features
                  speechSupported={speechSupported || false}
                  isListening={isListening || false}
                  isSpeaking={isSpeaking || false}
                  onStartListening={startListening}
                  onStopListening={stopListening}
                  onSpeak={speak}
                  onStopSpeaking={stopSpeaking}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Status Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
            onClick={() => {
              if (typeof stopListening === 'function') {
                stopListening();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 10 }}
              className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-gray-200 mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-7xl mb-4"
              >
                🎤
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 
                 currentLanguage === 'pa' ? 'ਸੁਣ ਰਿਹਾ ਹਾਂ...' : 
                 'I\'m Listening...'}
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {currentLanguage === 'hi' ? 'अपना कृषि सवाल बोलें' : 
                 currentLanguage === 'pa' ? 'ਆਪਣਾ ਖੇਤੀ ਸਵਾਲ ਬੋਲੋ' : 
                 'Ask your farming question'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (typeof stopListening === 'function') {
                    stopListening();
                  }
                }}
                className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg"
              >
                {currentLanguage === 'hi' ? 'रोकें' : 
                 currentLanguage === 'pa' ? 'ਰੋਕੋ' : 
                 'Stop Listening'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
