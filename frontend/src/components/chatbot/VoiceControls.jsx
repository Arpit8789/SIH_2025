// components/chatbot/VoiceControls.jsx - Voice Input/Output Controls
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Waves } from 'lucide-react';

const VoiceControls = ({
  speechSupported,
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  currentLanguage,
  disabled = false
}) => {
  if (!speechSupported) {
    return null;
  }

  const getLanguageText = (key) => {
    const texts = {
      listening: {
        hi: 'सुन रहा हूँ...',
        pa: 'ਸੁਣ ਰਿਹਾ ਹਾਂ...',
        en: 'Listening...'
      },
      speaking: {
        hi: 'बोल रहा हूँ...',
        pa: 'ਬੋਲ ਰਿਹਾ ਹਾਂ...',
        en: 'Speaking...'
      },
      clickToSpeak: {
        hi: 'बोलने के लिए क्लिक करें',
        pa: 'ਬੋਲਣ ਲਈ ਕਲਿਕ ਕਰੋ',
        en: 'Click to speak'
      },
      stopListening: {
        hi: 'सुनना बंद करें',
        pa: 'ਸੁਣਨਾ ਬੰਦ ਕਰੋ',
        en: 'Stop listening'
      },
      stopSpeaking: {
        hi: 'बोलना बंद करें',
        pa: 'ਬੋਲਣਾ ਬੰਦ ਕਰੋ',
        en: 'Stop speaking'
      }
    };
    return texts[key]?.[currentLanguage] || texts[key]?.en || '';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Input Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? onStopListening : onStartListening}
        disabled={disabled || isSpeaking}
        className={`relative p-3 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? getLanguageText('stopListening') : getLanguageText('clickToSpeak')}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        
        {/* Listening Animation */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.3 }}
              exit={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
              className="absolute inset-0 bg-red-400 rounded-full opacity-30"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Voice Output Button */}
      {isSpeaking && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStopSpeaking}
          className="relative p-3 bg-blue-500 text-white rounded-full shadow-lg transition-all duration-200"
          title={getLanguageText('stopSpeaking')}
        >
          <VolumeX className="w-5 h-5" />
          
          {/* Speaking Animation */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.2 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            className="absolute inset-0 bg-blue-400 rounded-full opacity-30"
          />
        </motion.button>
      )}

      {/* Voice Status Indicator */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center space-x-2 text-sm"
          >
            <Waves className={`w-4 h-4 ${
              isListening ? 'text-red-500' : 'text-blue-500'
            }`} />
            <span className={`font-medium ${
              isListening ? 'text-red-600' : 'text-blue-600'
            }`}>
              {isListening ? getLanguageText('listening') : getLanguageText('speaking')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceControls;
