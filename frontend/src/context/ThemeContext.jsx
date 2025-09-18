// src/context/ThemeContext.jsx - FIXED IMPORTS
import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '@/utils/storage'

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Create Theme Context
const ThemeContext = createContext(null)

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(THEME_MODES.SYSTEM)
  const [actualTheme, setActualTheme] = useState(THEME_MODES.LIGHT)

  // Initialize theme on app load
  useEffect(() => {
    initializeTheme()
  }, [])

  // Update actual theme when mode changes or system theme changes
  useEffect(() => {
    updateActualTheme()
    
    if (mode === THEME_MODES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateActualTheme()
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mode])

  // Apply theme to document
  useEffect(() => {
    applyTheme(actualTheme)
  }, [actualTheme])

  const initializeTheme = () => {
    try {
      const savedTheme = storage.getTheme()
      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        setMode(savedTheme)
      } else {
        setMode(THEME_MODES.SYSTEM)
      }
    } catch (error) {
      console.error('Theme initialization error:', error)
      setMode(THEME_MODES.SYSTEM)
    }
  }

  const updateActualTheme = () => {
    let newTheme = THEME_MODES.LIGHT

    if (mode === THEME_MODES.LIGHT) {
      newTheme = THEME_MODES.LIGHT
    } else if (mode === THEME_MODES.DARK) {
      newTheme = THEME_MODES.DARK
    } else {
      // System mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      newTheme = prefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT
    }

    setActualTheme(newTheme)
  }

  const applyTheme = (theme) => {
    const root = document.documentElement
    
    if (theme === THEME_MODES.DARK) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update theme-color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === THEME_MODES.DARK ? '#1f2937' : '#059669')
    }
  }

  // Change theme mode
  const changeMode = (newMode) => {
    if (!Object.values(THEME_MODES).includes(newMode)) {
      console.error(`Invalid theme mode: ${newMode}`)
      return false
    }

    try {
      setMode(newMode)
      storage.setTheme(newMode)
      return true
    } catch (error) {
      console.error('Theme change error:', error)
      return false
    }
  }

  // Toggle theme (light <-> dark)
  const toggleTheme = () => {
    if (mode === THEME_MODES.LIGHT) {
      changeMode(THEME_MODES.DARK)
    } else if (mode === THEME_MODES.DARK) {
      changeMode(THEME_MODES.LIGHT)
    } else {
      // If system, toggle to opposite of current actual theme
      const newMode = actualTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK
      changeMode(newMode)
    }
  }

  // Check if dark theme is active
  const isDark = () => {
    return actualTheme === THEME_MODES.DARK
  }

  // Check if light theme is active
  const isLight = () => {
    return actualTheme === THEME_MODES.LIGHT
  }

  // Check if system mode is active
  const isSystem = () => {
    return mode === THEME_MODES.SYSTEM
  }

  // Get theme colors for current theme
  const getThemeColors = () => {
    return {
      primary: isDark() ? '#10b981' : '#059669',
      secondary: isDark() ? '#fbbf24' : '#f59e0b',
      background: isDark() ? '#111827' : '#ffffff',
      foreground: isDark() ? '#f9fafb' : '#111827',
      muted: isDark() ? '#374151' : '#f3f4f6',
      border: isDark() ? '#374151' : '#e5e7eb',
    }
  }

  // Context value
  const value = {
    // State
    mode,
    actualTheme,
    theme: actualTheme, // ADDED: For compatibility with useTheme hook
    
    // Theme info
    isDark: isDark(),
    isLight: isLight(),
    isSystem: isSystem(),
    colors: getThemeColors(),
    
    // Actions
    changeMode,
    toggleTheme,
    
    // Constants
    modes: THEME_MODES,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Custom hook to use Theme Context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// Export context for advanced use cases
export { ThemeContext }
