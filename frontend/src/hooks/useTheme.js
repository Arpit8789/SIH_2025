// src/hooks/useTheme.js - FIXED (Added missing React import)
import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light', // 'light' | 'dark' | 'system'
      systemTheme: 'light',
      actualTheme: 'light', // resolved theme (light/dark)

      // Actions
      setTheme: (theme) => {
        set({ theme })
        
        // Update actual theme based on selection
        const actualTheme = theme === 'system' 
          ? get().systemTheme 
          : theme
        
        set({ actualTheme })
        
        // Apply to document
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(actualTheme)
        
        // Update meta theme-color
        const themeColorMeta = document.querySelector('meta[name="theme-color"]')
        if (themeColorMeta) {
          themeColorMeta.content = actualTheme === 'dark' ? '#059669' : '#10b981'
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      initializeTheme: () => {
        // Detect system theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light'
        
        set({ systemTheme })
        
        // Set initial theme
        const savedTheme = get().theme || 'system'
        const actualTheme = savedTheme === 'system' ? systemTheme : savedTheme
        
        set({ actualTheme })
        
        // Apply to document
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(actualTheme)
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          const newSystemTheme = e.matches ? 'dark' : 'light'
          set({ systemTheme: newSystemTheme })
          
          // Update actual theme if using system theme
          if (get().theme === 'system') {
            set({ actualTheme: newSystemTheme })
            root.classList.remove('light', 'dark')
            root.classList.add(newSystemTheme)
          }
        })
      }
    }),
    {
      name: 'krishi-theme-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

export const useTheme = () => {
  const store = useThemeStore()
  
  // Initialize theme on first use - NOW WITH PROPER React IMPORT
  React.useEffect(() => {
    store.initializeTheme()
  }, [])
  
  return store
}
