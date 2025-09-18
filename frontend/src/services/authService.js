// src/services/authService.js - REAL BACKEND CONNECTION
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    console.log('🌐 AuthService: Base URL =', this.baseURL)
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`)
    
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
      
      console.log(`✅ API Response [${response.status}]:`, data)
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // ✅ REAL BACKEND: Register user
  async register(userData) {
    try {
      console.log('📝 AuthService: Registering user...', userData)
      
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      console.log('📝 AuthService: Registration response =', response)
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Registration successful'
      }
    } catch (error) {
      console.error('📝 AuthService: Registration error =', error)
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      }
    }
  }

  // ✅ REAL BACKEND: Login user
  async login(credentials) {
    try {
      console.log('🔐 AuthService: Logging in user...', credentials.email)
      
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      console.log('🔐 AuthService: Login response =', response)

      // Store tokens if login successful
      if (response.success && response.data?.tokens) {
        localStorage.setItem('krishi_access_token', response.data.tokens.accessToken)
        localStorage.setItem('krishi_refresh_token', response.data.tokens.refreshToken)
        localStorage.setItem('krishi_user_data', JSON.stringify(response.data.user))
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Login successful'
      }
    } catch (error) {
      console.error('🔐 AuthService: Login error =', error)
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.'
      }
    }
  }

  // ✅ REAL BACKEND: Verify OTP
  async verifyOTP(otpData) {
    try {
      console.log('📧 AuthService: Verifying OTP...', otpData)
      
      const response = await this.apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(otpData)
      })

      console.log('📧 AuthService: OTP verification response =', response)

      // Store tokens if verification successful
      if (response.success && response.data?.tokens) {
        localStorage.setItem('krishi_access_token', response.data.tokens.accessToken)
        localStorage.setItem('krishi_refresh_token', response.data.tokens.refreshToken)
        localStorage.setItem('krishi_user_data', JSON.stringify(response.data.user))
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Email verified successfully'
      }
    } catch (error) {
      console.error('📧 AuthService: OTP verification error =', error)
      return {
        success: false,
        message: error.message || 'OTP verification failed'
      }
    }
  }

  // ✅ REAL BACKEND: Resend OTP
  async resendOTP(email) {
    try {
      console.log('🔄 AuthService: Resending OTP to', email)
      
      const response = await this.apiCall('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      })

      console.log('🔄 AuthService: Resend OTP response =', response)
      
      return {
        success: true,
        message: response.message || 'OTP sent successfully'
      }
    } catch (error) {
      console.error('🔄 AuthService: Resend OTP error =', error)
      return {
        success: false,
        message: error.message || 'Failed to resend OTP'
      }
    }
  }

  // ✅ REAL BACKEND: Verify token
  async verifyToken() {
    try {
      console.log('🔍 AuthService: Verifying token...')
      
      const response = await this.apiCall('/auth/verify-token', {
        method: 'GET'
      })

      console.log('🔍 AuthService: Token verification response =', response)
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Token valid'
      }
    } catch (error) {
      console.error('🔍 AuthService: Token verification error =', error)
      // Clear invalid tokens
      this.clearTokens()
      return {
        success: false,
        message: error.message || 'Invalid token'
      }
    }
  }

  // ✅ REAL BACKEND: Logout
  async logout() {
    try {
      console.log('👋 AuthService: Logging out...')
      
      const response = await this.apiCall('/auth/logout', {
        method: 'POST'
      })

      console.log('👋 AuthService: Logout response =', response)
      
      // Clear local storage regardless of API response
      this.clearTokens()
      
      return {
        success: true,
        message: response.message || 'Logged out successfully'
      }
    } catch (error) {
      console.error('👋 AuthService: Logout error =', error)
      // Clear tokens even if API call fails
      this.clearTokens()
      return {
        success: true, // Still return success since local cleanup worked
        message: 'Logged out successfully'
      }
    }
  }

  // ✅ REAL BACKEND: Update profile
  async updateProfile(updates) {
    try {
      console.log('✏️ AuthService: Updating profile...', updates)
      
      const response = await this.apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      console.log('✏️ AuthService: Profile update response =', response)

      // Update stored user data
      if (response.success && response.data) {
        const currentUser = JSON.parse(localStorage.getItem('krishi_user_data') || '{}')
        const updatedUser = { ...currentUser, ...response.data }
        localStorage.setItem('krishi_user_data', JSON.stringify(updatedUser))
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Profile updated successfully'
      }
    } catch (error) {
      console.error('✏️ AuthService: Profile update error =', error)
      return {
        success: false,
        message: error.message || 'Profile update failed'
      }
    }
  }

  // ✅ REAL BACKEND: Refresh token
  async refreshToken(data) {
    try {
      console.log('🔄 AuthService: Refreshing token...')
      
      const refreshToken = data?.refreshToken || localStorage.getItem('krishi_refresh_token')
      
      const response = await this.apiCall('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      console.log('🔄 AuthService: Token refresh response =', response)

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
        message: response.message || 'Token refreshed'
      }
    } catch (error) {
      console.error('🔄 AuthService: Token refresh error =', error)
      // Clear invalid tokens
      this.clearTokens()
      return {
        success: false,
        message: error.message || 'Token refresh failed'
      }
    }
  }

  // ✅ REAL BACKEND: Forgot password
  async forgotPassword(email) {
    try {
      console.log('🔑 AuthService: Forgot password for', email)
      
      const response = await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })

      console.log('🔑 AuthService: Forgot password response =', response)
      
      return {
        success: true,
        message: response.message || 'Password reset email sent successfully'
      }
    } catch (error) {
      console.error('🔑 AuthService: Forgot password error =', error)
      return {
        success: false,
        message: error.message || 'Failed to send reset email'
      }
    }
  }

  // ✅ REAL BACKEND: Reset password
  async resetPassword(data) {
    try {
      console.log('🔐 AuthService: Resetting password...')
      
      const response = await this.apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      console.log('🔐 AuthService: Reset password response =', response)
      
      return {
        success: true,
        message: response.message || 'Password reset successfully'
      }
    } catch (error) {
      console.error('🔐 AuthService: Reset password error =', error)
      return {
        success: false,
        message: error.message || 'Password reset failed'
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
      console.error('Failed to parse stored user data:', error)
      return null
    }
  }

  // Helper method to get stored token
  getStoredToken() {
    return localStorage.getItem('krishi_access_token')
  }
}

export const authService = new AuthService()
