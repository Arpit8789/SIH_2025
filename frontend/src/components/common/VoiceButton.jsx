// src/components/common/VoiceButton.jsx
import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/hooks/useVoice';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const VoiceButton = ({
  onTranscript,
  onSpeak,
  mode = 'listen', // 'listen' | 'speak' | 'both'
  textToSpeak,
  className,
  size = 'default',
  variant = 'outline'
}) => {
  const [isListeningMode, setIsListeningMode] = useState(true);
  const { t } = useLanguage();
  
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported
  } = useVoice({
    onResult: (text, confidence) => {
      if (onTranscript && confidence > 0.7) {
        onTranscript(text);
      }
    },
    autoStopTimeout: 5000, // Stop after 5 seconds of silence
    continuous: false
  });

  if (!isSupported) {
    return (
      <Button 
        variant="ghost" 
        size={size}
        disabled
        className={cn("opacity-50", className)}
        title={t('voice.notSupported')}
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  const handleVoiceAction = async () => {
    if (mode === 'listen' || (mode === 'both' && isListeningMode)) {
      // Voice input mode
      if (isListening) {
        stopListening();
      } else {
        const success = await startListening();
        if (!success) {
          console.error('Failed to start voice recognition');
        }
      }
    } else {
      // Text-to-speech mode
      if (isSpeaking) {
        stopSpeaking();
      } else {
        if (textToSpeak) {
          const success = await speak(textToSpeak);
          if (success && onSpeak) {
            onSpeak(textToSpeak);
          }
        }
      }
    }
  };

  const getIcon = () => {
    if (mode === 'speak' || (mode === 'both' && !isListeningMode)) {
      return isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />;
    }
    return isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (mode === 'speak' || (mode === 'both' && !isListeningMode)) {
      return isSpeaking ? t('voice.stopSpeaking') : t('voice.speakText');
    }
    return isListening ? t('voice.stopListening') : t('voice.startListening');
  };

  const getButtonState = () => {
    if (isListening || isSpeaking) {
      return 'active';
    }
    return 'inactive';
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={getButtonState() === 'active' ? 'destructive' : variant}
        size={size}
        onClick={handleVoiceAction}
        className={cn(
          "transition-all duration-200",
          getButtonState() === 'active' && "animate-pulse",
          className
        )}
        title={getTitle()}
      >
        {getIcon()}
        {(isListening || isSpeaking) && (
          <span className="ml-2 text-xs">
            {isListening ? t('voice.listening') : t('voice.speaking')}
          </span>
        )}
      </Button>

      {/* Mode toggle for 'both' mode */}
      {mode === 'both' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsListeningMode(!isListeningMode)}
          className="px-2"
          title={t('voice.switchMode')}
        >
          {isListeningMode ? '🎤' : '🔊'}
        </Button>
      )}
    </div>
  );
};

// Specialized voice components for different use cases
export const CropVoiceSearch = ({ onVoiceSearch }) => (
  <VoiceButton
    mode="listen"
    onTranscript={(text) => onVoiceSearch(text)}
    className="text-green-600 hover:text-green-700"
    size="sm"
  />
);

export const WeatherVoiceQuery = ({ onVoiceQuery }) => (
  <VoiceButton
    mode="listen"
    onTranscript={(text) => onVoiceQuery(text)}
    className="text-sky-600 hover:text-sky-700"
    size="sm"
  />
);

export const PriceVoiceAnnouncement = ({ priceText }) => (
  <VoiceButton
    mode="speak"
    textToSpeak={priceText}
    className="text-emerald-600 hover:text-emerald-700"
    size="sm"
  />
);

export default VoiceButton;
