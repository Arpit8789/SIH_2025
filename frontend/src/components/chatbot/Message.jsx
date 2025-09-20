// components/chatbot/Message.jsx - Individual Message Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Volume2, VolumeX, Copy, Check, Mic, Zap } from 'lucide-react';

const Message = ({ 
  message, 
  index, 
  speechSupported, 
  isSpeaking, 
  onSpeak, 
  onStopSpeaking 
}) => {
  const [copied, setCopied] = useState(false);

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Copy message to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex space-x-3 max-w-[85%] ${
        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-green-900 text-white' 
            : message.isError 
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
        }`}>
          {message.role === 'user' ? (
            <User className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col space-y-1 ${
          message.role === 'user' ? 'items-end' : 'items-start'
        }`}>
          <div className={`px-4 py-3 rounded-2xl relative group ${
            message.role === 'user'
              ? 'dark:bg-gray-900 bg-gray-200 dark:text-white rounded-br-sm'
              : message.isError
                ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-sm'
                : 'dark:bg-gray-900 bg-gray-200 dark:text-white  rounded-bl-sm shadow-sm'
          }`}>
            {/* Message Indicators */}
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Voice indicator */}
              {message.isVoice && (
                <div className="flex items-center space-x-1 text-xs opacity-70 bg-black/10 px-2 py-1 rounded-full">
                  <Mic className="w-3 h-3" />
                  <span>Voice</span>
                </div>
              )}

              {/* Quick action indicator */}
              {message.isQuickAction && (
                <div className="flex items-center space-x-1 text-xs opacity-70 bg-black/10 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  <span>Quick Action</span>
                </div>
              )}
            </div>

            {/* Message Text */}
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>

            {/* Action Buttons */}
            <div className={`mt-2 flex items-center space-x-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className={`p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  message.role === 'user' 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Voice playback button for assistant messages */}
              {message.role === 'assistant' && speechSupported && !message.isError && (
                <button
                  onClick={() => isSpeaking ? onStopSpeaking() : onSpeak(message.content)}
                  className={`p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                    message.role === 'user' 
                      ? 'hover:bg-white/20 text-white' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Message Metadata */}
          <div className={`text-xs text-gray-500 px-2 flex items-center space-x-2 ${
            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {message.tokens && (
              <>
                <span>•</span>
                <span className="opacity-60">{message.tokens} tokens</span>
              </>
            )}
            {message.isError && (
              <>
                <span>•</span>
                <span className="text-red-500 text-xs">Error</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
