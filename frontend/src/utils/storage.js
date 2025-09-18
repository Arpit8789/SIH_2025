// src/utils/storage.js - CREATE THIS
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'krishi_access_token',
  REFRESH_TOKEN: 'krishi_refresh_token', 
  USER_DATA: 'krishi_user_data',
  THEME: 'krishi_theme',
  LANGUAGE: 'krishi_language',
  ONBOARDING: 'krishi_onboarding_complete'
}

class Storage {
  // Token methods
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  }

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  // Refresh token methods
  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  removeRefreshToken() {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  // User data methods
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
  }

  getUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  }

  // Clear all auth data
  clearAuth() {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUser()
  }

  // Theme methods
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light'
  }

  // Language methods
  setLanguage(language) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
  }

  getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'hi'
  }

  // Onboarding methods
  setOnboardingComplete(completed = true) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, completed.toString())
  }

  isOnboardingComplete() {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true'
  }

  // Generic methods
  set(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error)
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      
      try {
        return JSON.parse(item)
      } catch {
        return item
      }
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error)
      return defaultValue
    }
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }

  // Get all stored data (for debugging)
  getAll() {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('krishi_')) {
        data[key] = this.get(key)
      }
    }
    return data
  }
}

export const storage = new Storage()
export { STORAGE_KEYS }
