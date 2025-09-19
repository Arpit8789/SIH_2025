// src/services/authService.js - UPDATED TO USE REACT-HOT-TOAST
import toast from 'react-hot-toast'

class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    console.log('🌐 AuthService: Base URL =', this.baseURL)
  }

  // ✅ Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }

    // Add authorization token if available
    const token = localStorage.getItem('krishi_access_token')
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, finalOptions)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }
      
      return data
    } catch (error) {
      throw error
    }
  }

  // ✅ Human-readable error messages with emojis
  getHumanReadableError(message) {
    const errorMap = {
      // Registration errors
      'User already exists with this email or phone': '😔 An account with this email or phone already exists. Try logging in instead.',
      'All fields are required': '📝 Please fill in all required fields to continue.',
      'Passwords do not match': '🔒 Passwords don\'t match. Please check and try again.',
      'Password must be at least 6 characters': '🔑 Password should be at least 6 characters long for security.',
      'Please enter a valid email address': '📧 Please enter a valid email address.',
      'Please enter a valid 10-digit Indian phone number': '📱 Please enter a valid 10-digit phone number.',
      'You must agree to terms and conditions': '📋 Please agree to the terms and conditions to continue.',
      
      // Login errors
      'Invalid email or password': '🚫 Email or password is incorrect. Please try again.',
      'Email and password are required': '📝 Please enter both email and password.',
      'Account is deactivated. Please contact support.': '⚠️ Your account has been deactivated. Please contact support.',
      'Please verify your email before logging in': '📧 Please verify your email address before logging in.',
      
      // Network errors
      'Network Error': '🌐 Network connection problem. Please check your internet.',
      'Failed to fetch': '🌐 Network connection problem. Please check your internet.',
      'Request failed with status code 400': '❌ Invalid request. Please check your information.',
      'Request failed with status code 401': '🔐 Authentication failed. Please login again.',
      'Request failed with status code 403': '🚫 Access denied. You don\'t have permission.',
      'Request failed with status code 404': '❓ Service not found. Please try again later.',
      'Request failed with status code 500': '⚠️ Server error. Please try again later.',
      
      // OTP errors
      'OTP must be 6 digits': '🔢 Please enter a valid 6-digit OTP.',
      'User not found': '❓ Account not found. Please check your email.',
      'Invalid OTP': '🔢 The OTP you entered is incorrect. Please try again.',
      'OTP has expired': '⏰ OTP has expired. Please request a new one.',
      
      // Password reset errors
      'Token and new password are required': '🔑 Please provide both reset token and new password.',
      'Invalid or expired reset token': '⏰ Reset link has expired. Please request a new one.'
    };

    return errorMap[message] || `⚠️ ${message}`;
  }

  // ✅ REAL BACKEND: Register user
  async register(userData) {
    try {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      
      return {
        success: true,
        data: response.data,
        message: '🌾 Registration successful! Welcome to Krishi Sahayak!'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Login user
  async login(credentials) {
    try {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      // Store tokens if login successful
      if (response.success && response.data?.tokens) {
        localStorage.setItem('krishi_access_token', response.data.tokens.accessToken)
        localStorage.setItem('krishi_refresh_token', response.data.tokens.refreshToken)
        localStorage.setItem('krishi_user_data', JSON.stringify(response.data.user))
      }
      
      return {
        success: true,
        data: response.data,
        message: '🌾 Welcome back to Krishi Sahayak!'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Verify OTP
  async verifyOTP(otpData) {
    try {
      const response = await this.apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(otpData)
      })

      // Store tokens if verification successful
      if (response.success && response.data?.tokens) {
        localStorage.setItem('krishi_access_token', response.data.tokens.accessToken)
        localStorage.setItem('krishi_refresh_token', response.data.tokens.refreshToken)
        localStorage.setItem('krishi_user_data', JSON.stringify(response.data.user))
      }
      
      return {
        success: true,
        data: response.data,
        message: '🎉 Email verified successfully! Welcome to Krishi Sahayak!'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Resend OTP
  async resendOTP(email) {
    try {
      const response = await this.apiCall('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      
      return {
        success: true,
        message: '📧 New OTP sent to your email! Please check your inbox.'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Verify token
  async verifyToken() {
    try {
      const response = await this.apiCall('/auth/profile', {
        method: 'GET'
      })
      
      return {
        success: true,
        data: response.data,
        message: 'Token valid'
      }
    } catch (error) {
      // Clear invalid tokens
      this.clearTokens()
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Logout
  async logout() {
    try {
      await this.apiCall('/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      // Ignore logout API errors
    } finally {
      // Clear local storage regardless of API response
      this.clearTokens()
    }
    
    return {
      success: true,
      message: '👋 Logged out successfully. See you soon!'
    }
  }

  // ✅ REAL BACKEND: Forgot password
  async forgotPassword(email) {
    try {
      const response = await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      
      return {
        success: true,
        message: '📧 Password reset link sent! Please check your email.'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Reset password
  async resetPassword(data) {
    try {
      const response = await this.apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return {
        success: true,
        message: '✅ Password reset successfully! You can now login with your new password.'
      }
    } catch (error) {
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // ✅ REAL BACKEND: Refresh token
  async refreshToken(data) {
    try {
      const refreshToken = data?.refreshToken || localStorage.getItem('krishi_refresh_token')
      
      const response = await this.apiCall('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      // Update stored tokens
      if (response.success && response.data?.tokens) {
        localStorage.setItem('krishi_access_token', response.data.tokens.accessToken)
        if (response.data.tokens.refreshToken) {
          localStorage.setItem('krishi_refresh_token', response.data.tokens.refreshToken)
        }
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Token refreshed'
      }
    } catch (error) {
      // Clear invalid tokens
      this.clearTokens()
      return {
        success: false,
        message: this.getHumanReadableError(error.message)
      }
    }
  }

  // Helper method to clear tokens
  clearTokens() {
    localStorage.removeItem('krishi_access_token')
    localStorage.removeItem('krishi_refresh_token')
    localStorage.removeItem('krishi_user_data')
  }

  // Helper method to get stored user
  getStoredUser() {
    try {
      const userData = localStorage.getItem('krishi_user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      return null
    }
  }

  // Helper method to get stored token
  getStoredToken() {
    return localStorage.getItem('krishi_access_token')
  }
}

export const authService = new AuthService()
