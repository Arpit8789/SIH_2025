// src/lib/speech.js - COMPLETE
class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis
    this.recognition = null
    this.isListening = false
    this.voices = []
    
    this.initializeRecognition()
    this.loadVoices()
  }

  initializeRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition()
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition()
    }

    if (this.recognition) {
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = 'hi-IN' // default to Hindi
    }
  }

  loadVoices() {
    this.voices = this.synthesis.getVoices()
    
    // Load voices when they become available
    this.synthesis.onvoiceschanged = () => {
      this.voices = this.synthesis.getVoices()
    }
  }

  // Speech Recognition (Voice to Text)
  startListening(language = 'hi-IN') {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (this.isListening) {
        reject(new Error('Already listening'))
        return
      }

      this.recognition.lang = language
      this.isListening = true

      let finalTranscript = ''
      let interimTranscript = ''

      this.recognition.onresult = (event) => {
        interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Return interim results
        if (interimTranscript) {
          resolve({
            transcript: interimTranscript,
            isFinal: false
          })
        }
      }

      this.recognition.onend = () => {
        this.isListening = false
        resolve({
          transcript: finalTranscript,
          isFinal: true
        })
      }

      this.recognition.onerror = (event) => {
        this.isListening = false
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      this.recognition.start()
    })
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  // Text to Speech (Voice Synthesis)
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set options
      utterance.lang = options.lang || 'hi-IN'
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      // Find appropriate voice
      if (options.voice || options.lang) {
        const voice = this.findVoice(options.lang, options.voice)
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      this.synthesis.speak(utterance)
    })
  }

  findVoice(lang, voiceName) {
    return this.voices.find(voice => {
      if (voiceName && voice.name.includes(voiceName)) return true
      if (lang && voice.lang === lang) return true
      if (lang && voice.lang.startsWith(lang.split('-')[0])) return true
      return false
    })
  }

  // Get available voices for a language
  getVoicesForLanguage(lang) {
    return this.voices.filter(voice => 
      voice.lang === lang || voice.lang.startsWith(lang.split('-')[0])
    )
  }

  // Agricultural specific speech functions
  speakCropAdvice(advice, language = 'hi-IN') {
    const options = {
      lang: language,
      rate: 0.9, // Slightly slower for better comprehension
      pitch: 1
    }
    return this.speak(advice, options)
  }

  speakWeatherAlert(alert, language = 'hi-IN') {
    const options = {
      lang: language,
      rate: 0.8, // Slower for important alerts
      pitch: 1.1, // Slightly higher pitch for alerts
      volume: 1
    }
    return this.speak(alert, options)
  }

  speakMarketPrice(priceInfo, language = 'hi-IN') {
    const options = {
      lang: language,
      rate: 1,
      pitch: 1
    }
    return this.speak(priceInfo, options)
  }

  // Convert speech to agricultural query
  async listenForAgriculturalQuery(language = 'hi-IN') {
    try {
      const result = await this.startListening(language)
      
      if (result.isFinal && result.transcript) {
        // Process agricultural terms
        return this.processAgriculturalQuery(result.transcript, language)
      }
      
      return result
    } catch (error) {
      console.error('Agricultural query listening error:', error)
      throw error
    }
  }

  processAgriculturalQuery(transcript, language) {
    const query = transcript.toLowerCase()
    
    // Identify query type based on keywords
    let queryType = 'general'
    let entities = []

    // Hindi crop keywords
    const hindiCrops = {
      'गेहूं': 'wheat',
      'धान': 'rice', 
      'चावल': 'rice',
      'मक्का': 'maize',
      'जौ': 'barley',
      'दाल': 'pulses',
      'सरसों': 'mustard',
      'आलू': 'potato',
      'टमाटर': 'tomato'
    }

    // English crop keywords
    const englishCrops = ['wheat', 'rice', 'maize', 'barley', 'potato', 'tomato']

    // Detect query type
    if (query.includes('मौसम') || query.includes('weather')) {
      queryType = 'weather'
    } else if (query.includes('कीमत') || query.includes('भाव') || query.includes('price')) {
      queryType = 'price'
    } else if (query.includes('बीमारी') || query.includes('रोग') || query.includes('disease')) {
      queryType = 'disease'
    } else if (query.includes('खाद') || query.includes('उर्वरक') || query.includes('fertilizer')) {
      queryType = 'fertilizer'
    }

    // Extract crop names
    Object.entries(hindiCrops).forEach(([hindi, english]) => {
      if (query.includes(hindi)) {
        entities.push({ type: 'crop', value: english, original: hindi })
      }
    })

    englishCrops.forEach(crop => {
      if (query.includes(crop)) {
        entities.push({ type: 'crop', value: crop, original: crop })
      }
    })

    return {
      transcript: transcript,
      queryType,
      entities,
      language,
      isFinal: true
    }
  }

  // Check if speech features are available
  isSupported() {
    return {
      synthesis: !!this.synthesis,
      recognition: !!this.recognition
    }
  }

  // Get current listening status
  getStatus() {
    return {
      isListening: this.isListening,
      voicesLoaded: this.voices.length > 0,
      synthesis: !!this.synthesis,
      recognition: !!this.recognition
    }
  }
}

export const speechService = new SpeechService()
