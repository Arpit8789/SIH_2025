// src/context/NotificationContext.jsx - FIXED IMPORTS
import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
}

// Create Notification Context
const NotificationContext = createContext(null)

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // Show notification function
  const showNotification = (message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
    const notificationOptions = {
      duration: 4000,
      position: 'top-right',
      style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#333',
        padding: '16px',
        fontSize: '14px',
        maxWidth: '400px',
        ...options.style,
      },
      ...options,
    }

    let toastId

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toastId = toast.success(message, {
          ...notificationOptions,
          icon: '🌾',
          style: {
            ...notificationOptions.style,
            borderLeft: '4px solid #10b981',
          },
        })
        break

      case NOTIFICATION_TYPES.ERROR:
        toastId = toast.error(message, {
          ...notificationOptions,
          icon: '⚠️',
          style: {
            ...notificationOptions.style,
            borderLeft: '4px solid #ef4444',
          },
        })
        break

      case NOTIFICATION_TYPES.WARNING:
        toastId = toast(message, {
          ...notificationOptions,
          icon: '⚡',
          style: {
            ...notificationOptions.style,
            borderLeft: '4px solid #f59e0b',
          },
        })
        break

      case NOTIFICATION_TYPES.INFO:
        toastId = toast(message, {
          ...notificationOptions,
          icon: 'ℹ️',
          style: {
            ...notificationOptions.style,
            borderLeft: '4px solid #3b82f6',
          },
        })
        break

      case NOTIFICATION_TYPES.LOADING:
        toastId = toast.loading(message, {
          ...notificationOptions,
          duration: Infinity, // Loading toasts don't auto-dismiss
        })
        break

      default:
        toastId = toast(message, notificationOptions)
    }

    // Add to notifications array
    const notification = {
      id: toastId,
      message,
      type,
      timestamp: new Date(),
    }

    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50

    return toastId
  }

  // Show success notification
  const showSuccess = (message, options = {}) => {
    return showNotification(message, NOTIFICATION_TYPES.SUCCESS, options)
  }

  // Show error notification
  const showError = (message, options = {}) => {
    return showNotification(message, NOTIFICATION_TYPES.ERROR, options)
  }

  // Show warning notification
  const showWarning = (message, options = {}) => {
    return showNotification(message, NOTIFICATION_TYPES.WARNING, options)
  }

  // Show info notification
  const showInfo = (message, options = {}) => {
    return showNotification(message, NOTIFICATION_TYPES.INFO, options)
  }

  // Show loading notification
  const showLoading = (message, options = {}) => {
    return showNotification(message, NOTIFICATION_TYPES.LOADING, options)
  }

  // Dismiss notification
  const dismiss = (toastId) => {
    toast.dismiss(toastId)
    
    // Remove from notifications array
    setNotifications(prev => prev.filter(n => n.id !== toastId))
  }

  // Dismiss all notifications
  const dismissAll = () => {
    toast.dismiss()
    setNotifications([])
  }

  // Update loading notification
  const updateLoading = (toastId, message, type = NOTIFICATION_TYPES.SUCCESS) => {
    // Dismiss the loading toast
    toast.dismiss(toastId)
    
    // Show new notification
    return showNotification(message, type)
  }

  // Show agricultural-specific notifications
  const showWeatherAlert = (message, severity = 'info') => {
    const icons = {
      low: '🌤️',
      medium: '⛈️',
      high: '🌪️',
      critical: '🚨',
    }

    return showNotification(`${icons[severity]} ${message}`, NOTIFICATION_TYPES.WARNING, {
      duration: 6000,
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d',
      },
    })
  }

  const showPriceAlert = (message, trend = 'stable') => {
    const icons = {
      rising: '📈',
      falling: '📉',
      stable: '➖',
    }

    const colors = {
      rising: { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
      falling: { bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
      stable: { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
    }

    return showNotification(`${icons[trend]} ${message}`, NOTIFICATION_TYPES.INFO, {
      duration: 5000,
      style: {
        background: colors[trend].bg,
        color: colors[trend].color,
        border: `1px solid ${colors[trend].border}`,
      },
    })
  }

  const showCropAlert = (message, type = 'info') => {
    const icons = {
      disease: '🦠',
      harvest: '🌾',
      planting: '🌱',
      fertilizer: '🧪',
      irrigation: '💧',
    }

    return showNotification(`${icons[type] || '🌿'} ${message}`, NOTIFICATION_TYPES.INFO, {
      duration: 5000,
    })
  }

  // Clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      setNotifications(prev => 
        prev.filter(n => n.timestamp > oneHourAgo)
      )
    }, 5 * 60 * 1000) // Clean every 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Context value
  const value = {
    // State
    notifications,

    // General notifications
    show: showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,

    // Control functions
    dismiss,
    dismissAll,
    updateLoading,

    // Agricultural-specific notifications
    showWeatherAlert,
    showPriceAlert,
    showCropAlert,

    // Types constant
    types: NOTIFICATION_TYPES,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use Notification Context
export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}

// Export context for advanced use cases
export { NotificationContext }
