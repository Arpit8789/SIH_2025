// src/services/voiceService.js
export const voiceService = {
  // Check if speech recognition is supported
  isSupported: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  // Start voice recognition
  startRecognition: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!voiceService.isSupported()) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configuration
      recognition.continuous = options.continuous || false;
      recognition.interimResults = options.interimResults || false;
      recognition.lang = options.language || 'en-IN';

      // Event handlers
      recognition.onresult = (event) => {
        const transcript = event.results.transcript;
        const confidence = event.results.confidence;
        
        resolve({
          transcript,
          confidence,
          isFinal: event.results.isFinal,
        });
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // Recognition ended
      };

      // Start recognition
      try {
        recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Text to speech
  speak: (text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuration
      utterance.lang = options.language || 'en-IN';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      // Start speaking
      speechSynthesis.speak(utterance);
    });
  },

  // Stop speech
  stop: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },

  // Get available voices
  getVoices: () => {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    return speechSynthesis.getVoices();
  },

  // Get Hindi/Punjabi voices
  getIndianVoices: () => {
    const voices = voiceService.getVoices();
    return voices.filter(voice => 
      voice.lang.includes('hi') || 
      voice.lang.includes('pa') || 
      voice.lang.includes('en-IN')
    );
  },
};
