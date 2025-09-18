// src/services/appService.js - CREATE THIS
// Application initialization service
export const initializeApp = async () => {
  try {
    // Initialize PWA service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      await navigator.serviceWorker.register('/sw.js')
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      // Preload voices
      window.speechSynthesis.getVoices()
    }

    // Initialize notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't request immediately, let user interact first
    }

    console.log('🌾 Krishi Sahayak initialized successfully')
  } catch (error) {
    console.error('App initialization error:', error)
  }
}

// App version and build info
export const APP_VERSION = '1.0.0'
export const BUILD_DATE = new Date().toISOString()
