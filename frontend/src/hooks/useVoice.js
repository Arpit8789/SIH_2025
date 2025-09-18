// src/hooks/useVoice.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '@services/voiceService';
import { useLanguage } from './useLanguage';
import { useNotification } from '@context/NotificationContext';

// Voice recognition and speech synthesis hook
export const useVoice = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const { currentLanguage } = useLanguage();
  const { showError, showInfo } = useNotification();
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check voice support on mount
  useEffect(() => {
    setIsSupported(voiceService.isSupported());
  }, []);

  // Language mapping for voice recognition
  const getVoiceLanguage = useCallback(() => {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'pa': 'pa-IN',
    };
    return langMap[currentLanguage] || 'en-IN';
  }, [currentLanguage]);

  // Start voice recognition
  const startListening = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Voice recognition not supported in this browser';
      setError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (isListening) return false;

    try {
      setIsListening(true);
      setError(null);
      setTranscript('');

      const voiceConfig = {
        language: getVoiceLanguage(),
        continuous: options.continuous || false,
        interimResults: options.interimResults || true,
      };

      const result = await voiceService.startRecognition(voiceConfig);
      
      if (result.transcript) {
        setTranscript(result.transcript);
        
        // Call onResult callback if provided
        if (options.onResult) {
          options.onResult(result.transcript, result.confidence);
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Voice recognition failed';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    } finally {
      setIsListening(false);
    }
  }, [isSupported, isListening, getVoiceLanguage, options, showError]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (!isListening) return;
    
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Speak text using text-to-speech
  const speak = useCallback(async (text) => {
    if (!text || isSpeaking) return false;

    try {
      setIsSpeaking(true);
      setError(null);

      const speechConfig = {
        language: getVoiceLanguage(),
        rate: options.speechRate || 1,
        pitch: options.speechPitch || 1,
        volume: options.speechVolume || 1,
      };

      await voiceService.speak(text, speechConfig);
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Text-to-speech failed';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking, getVoiceLanguage, options, showError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (!isSpeaking) return;
    
    voiceService.stop();
    setIsSpeaking(false);
  }, [isSpeaking]);

  // Auto-stop listening after timeout
  useEffect(() => {
    if (isListening && options.autoStopTimeout) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
        showInfo('Voice recognition stopped automatically');
      }, options.autoStopTimeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, options.autoStopTimeout, stopListening, showInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    
    // Utils
    clearTranscript: () => setTranscript(''),
    clearError: () => setError(null),
  };
};

export default useVoice;
