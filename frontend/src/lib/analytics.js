// src/lib/analytics.js - COMPLETE
class Analytics {
  constructor() {
    this.isInitialized = false
    this.events = []
  }

  initialize() {
    if (import.meta.env.DEV) {
      console.log('📊 Analytics initialized (dev mode)')
      this.isInitialized = true
      return
    }
    
    // Production analytics setup
    try {
      // Initialize Google Analytics, Plausible, or your preferred service
      if (typeof gtag !== 'undefined') {
        gtag('config', import.meta.env.VITE_GA_ID || 'GA_MEASUREMENT_ID')
      }
      
      this.isInitialized = true
      console.log('📊 Analytics initialized')
      
      // Send any queued events
      this.flushEvents()
    } catch (error) {
      console.error('Analytics initialization failed:', error)
    }
  }

  track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        language: navigator.language,
      }
    }

    if (import.meta.env.DEV) {
      console.log('📊 Track:', eventData)
      return
    }

    if (this.isInitialized) {
      this.sendEvent(eventData)
    } else {
      // Queue event for later
      this.events.push(eventData)
    }
  }

  page(path, title) {
    const pageData = {
      path,
      title: title || document.title,
      timestamp: new Date().toISOString()
    }

    if (import.meta.env.DEV) {
      console.log('📊 Page view:', pageData)
      return
    }

    if (this.isInitialized) {
      this.sendPageView(pageData)
    }
  }

  sendEvent(eventData) {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, eventData.properties)
    }
  }

  sendPageView(pageData) {
    // Send page view to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('config', import.meta.env.VITE_GA_ID, {
        page_path: pageData.path,
        page_title: pageData.title
      })
    }
  }

  flushEvents() {
    this.events.forEach(event => this.sendEvent(event))
    this.events = []
  }

  // Agricultural specific tracking
  trackCropSelection(cropName, season) {
    this.track('crop_selected', {
      crop_name: cropName,
      season: season,
      category: 'agriculture'
    })
  }

  trackWeatherAlert(alertType, severity) {
    this.track('weather_alert_viewed', {
      alert_type: alertType,
      severity: severity,
      category: 'weather'
    })
  }

  trackMarketPriceCheck(crop, market) {
    this.track('market_price_checked', {
      crop_name: crop,
      market_name: market,
      category: 'market'
    })
  }

  trackAIQuery(queryType, language) {
    this.track('ai_query', {
      query_type: queryType,
      language: language,
      category: 'ai'
    })
  }
}

export const analytics = new Analytics()
