// components/chatbot/ChatBot.jsx - GENERIC AI ASSISTANT (KEEP DESIGN)
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Sparkles, Minimize2, RotateCcw } from 'lucide-react';
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
    { code: 'en', name: 'English', flag: 'US' },
    { code: 'hi', name: 'हिंदी', flag: 'IN' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: 'IN' }
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
      {/* ✅ FLOATING CHATBOT BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
          >
            <div 
              onClick={handleOpenChat}
              onMouseDown={handleOpenChat}
              onTouchStart={handleOpenChat}
              className="relative group cursor-pointer select-none"
            >
              {/* ✅ BIGGER BUTTON - Especially on desktop */}
              <motion.button
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  boxShadow: "0 20px 40px -12px rgba(34, 197, 94, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenChat}
                onMouseDown={handleOpenChat}
                onTouchStart={handleOpenChat}
                className={`
                  relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-3xl 
                  shadow-lg md:shadow-xl flex flex-col items-center justify-center 
                  transition-all duration-300 transform hover:shadow-2xl overflow-hidden 
                  active:scale-95 cursor-pointer select-none
                  ${isHealthy 
                    ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
                  }
                `}
                title="Chat with AI Assistant"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                
                {/* ✅ BIGGER ICON WITH AI TEXT */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex items-center mb-1">
                    <Bot className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white mr-1" />
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-yellow-300" />
                  </div>
                  <div className="text-xs md:text-sm lg:text-base font-bold text-white leading-none">
                    AI
                  </div>
                </div>

                {/* ✅ SUBTLE SHIMMER */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    ease: "linear",
                    repeatDelay: 5
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full transform -skew-x-12"
                />
              </motion.button>

              {/* ✅ SUBTLE PULSE */}
              {isHealthy && (
                <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-3xl bg-green-400 animate-pulse opacity-20"></div>
              )}

              {/* Invisible larger click area for better touch targets */}
              <div 
                className="absolute -inset-4 cursor-pointer"
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

      {/* ✅ CHAT WINDOW - PROPERLY SIZED FOR MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:inset-auto z-50"
            style={{
              height: 'min(70vh, 500px)',
              maxHeight: '70vh'
            }}
          >
            {/* ✅ PROPERLY SIZED CHAT CONTAINER */}
            <div className="w-full h-full md:w-[380px] md:h-[480px] lg:w-[420px] lg:h-[520px] bg-white rounded-lg md:rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden backdrop-blur-sm">
              
              {/* ✅ GENERIC AI ASSISTANT HEADER */}
              <div className="bg-gradient-to-r from-green-500 via-green-800 to-emerald-800 p-2 md:p-4 text-white relative overflow-hidden flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full -translate-x-8 -translate-y-8 md:-translate-x-12 md:-translate-y-12"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full translate-x-6 translate-y-6 md:translate-x-8 md:translate-y-8"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {/* ✅ AI ASSISTANT AVATAR */}
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-white mr-0.5" />
                        <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-yellow-300" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-sm md:text-lg">AI Assistant</h3>
                      <div className="flex items-center space-x-1 md:space-x-2 text-xs opacity-90">
                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isHealthy ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="text-xs">
                          {currentLanguage === 'hi' ? 'तैयार है' : 
                           currentLanguage === 'pa' ? 'ਤਿਆਰ ਹੈ' : 
                           'Ready to help'}
                        </span>
                        {isListening && (
                          <span className="text-xs bg-red-500/30 px-1 py-0.5 rounded border border-red-300/50">
                            🎤 
                          </span>
                        )}
                        {isSpeaking && (
                          <span className="text-xs bg-blue-500/30 px-1 py-0.5 rounded border border-blue-300/50">
                            🔊
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* ✅ COMPACT LANGUAGE SELECTOR */}
                    <select 
                      value={currentLanguage || 'en'}
                      onChange={(e) => {
                        if (typeof changeLanguage === 'function') {
                          changeLanguage(e.target.value);
                        }
                      }}
                      className="bg-white/20 text-white text-xs rounded-md px-1.5 py-1 border border-white/30 outline-none backdrop-blur-sm"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-800 bg-white">
                          {lang.flag}
                        </option>
                      ))}
                    </select>

                    {/* ✅ COMPACT RESET BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (typeof resetChat === 'function') {
                          resetChat();
                        }
                      }}
                      className="p-1 pl-5 hover:bg-white/20 rounded-md transition-all duration-200 backdrop-blur-sm"
                      title="Reset Chat"
                    >
                      <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                    </motion.button>

                    {/* ✅ COMPACT CLOSE BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseChat}
                      className="p-1 md:p-1.5 hover:bg-white/20 rounded-md transition-all duration-200 backdrop-blur-sm"
                      title="Close Chat"
                    >
                      <X className="w-4 h-4 md:w-4 md:h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 md:mt-2 bg-red-500/20 border border-red-300/50 rounded-lg p-1.5 md:p-2 flex items-center space-x-2 text-xs backdrop-blur-sm"
                  >
                    <div className="w-3 h-3 text-red-200 flex-shrink-0">⚠️</div>
                    <span className="text-red-100 text-xs">{String(error)}</span>
                  </motion.div>
                )}
              </div>

              {/* ✅ CHAT CONTENT - PROPERLY SIZED */}
              <div className="flex-1 flex flex-col min-h-0 dark:bg-black bg-white overflow-hidden">
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

      {/* ✅ VOICE STATUS OVERLAY */}
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
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 text-center shadow-2xl border border-gray-200 mx-4 max-w-sm w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl md:text-7xl mb-4"
              >
                🎤
              </motion.div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 
                 currentLanguage === 'pa' ? 'ਸੁਣ ਰਿਹਾ ਹਾਂ...' : 
                 'I\'m Listening...'}
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                {currentLanguage === 'hi' ? 'अपना सवाल बोलें' : 
                 currentLanguage === 'pa' ? 'ਆਪਣਾ ਸਵਾਲ ਬੋਲੋ' : 
                 'Ask me anything'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (typeof stopListening === 'function') {
                    stopListening();
                  }
                }}
                className="px-6 md:px-8 py-2 md:py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg"
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
