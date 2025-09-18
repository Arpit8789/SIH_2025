// src/lib/utils.js - CREATE THIS FILE
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Used by Shadcn/UI components for conditional styling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for Indian Rupees
 */
export function formatCurrency(amount, locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format numbers with Indian number system
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generate random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Indian mobile number
 */
export function isValidMobile(mobile) {
  const mobileRegex = /^[6-9]\d{9}$/
  return mobileRegex.test(mobile.replace(/\D/g, ''))
}

/**
 * Generate color based on string (for avatars, etc.)
 */
export function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Sleep function for async operations
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Agricultural utility functions
 */
export const agUtils = {
  /**
   * Get crop season based on month
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1
    if (month >= 6 && month <= 10) return 'kharif'
    if (month >= 11 || month <= 3) return 'rabi'
    return 'zaid'
  },

  /**
   * Get crop emoji based on category
   */
  getCropEmoji(category) {
    const emojis = {
      cereals: '🌾',
      pulses: '🌱',
      vegetables: '🥬',
      fruits: '🍎',
      spices: '🌶️',
      flowers: '🌺',
      cotton: '🪴',
      sugarcane: '🎋',
      default: '🌿'
    }
    return emojis[category?.toLowerCase()] || emojis.default
  },

  /**
   * Format yield (tons per hectare)
   */
  formatYield(yield_value, unit = 'tons/ha') {
    return `${yield_value.toFixed(2)} ${unit}`
  },

  /**
   * Get weather condition emoji
   */
  getWeatherEmoji(condition) {
    const conditions = {
      clear: '☀️',
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      thunderstorm: '⛈️',
      snow: '❄️',
      fog: '🌫️',
      windy: '💨',
      default: '🌤️'
    }
    return conditions[condition?.toLowerCase()] || conditions.default
  }
}
