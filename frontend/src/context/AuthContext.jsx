// src/context/AuthContext.jsx - COMPLETELY FIXED
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Auth action types
const AUTH_ACTIONS = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
}

// ✅ FIXED: Auth reducer (removed duplicate case)
const authReducer = (state, action) => {
  console.log('🔄 AuthReducer: Action =', action.type, action.payload)
  
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: action.payload ?? true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      }

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.TOKEN_REFRESH:
      return {
        ...state,
        token: action.payload,
      }

    default:
      return state
  }
}

// Create Auth Context
const AuthContext = createContext(null)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ✅ FIXED: Initialize auth with better error handling
  const initializeAuth = useCallback(async () => {
    console.log('🔍 AuthContext: Initializing auth...')
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const token = localStorage.getItem('krishi_access_token')
      const userData = localStorage.getItem('krishi_user_data')
      
      console.log('🔍 AuthContext: Stored token =', !!token)
      console.log('🔍 AuthContext: Stored user =', !!userData)

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          console.log('🔍 AuthContext: Verifying token with backend...')
          
          const response = await authService.verifyToken()
          
          if (response.success) {
            console.log('✅ AuthContext: Token valid, user authenticated')
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token },
            })
          } else {
            console.log('❌ AuthContext: Token invalid, clearing storage')
            authService.clearTokens()
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
          }
        } catch (error) {
          console.error('❌ AuthContext: Token verification failed:', error)
          authService.clearTokens()
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } else {
        console.log('🔍 AuthContext: No stored credentials, user not authenticated')
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false })
      }
    } catch (error) {
      console.error('❌ AuthContext: Auth initialization error:', error)
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: false })
    }
  }, [])

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // ✅ FIXED: Login function with better error handling
  const login = useCallback(async (credentials) => {
    console.log('🔐 AuthContext: Login attempt for', credentials.email)
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const response = await authService.login(credentials)
      
      if (response.success) {
        const { user, tokens } = response.data
        
        console.log('✅ AuthContext: Login successful')
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: tokens.accessToken },
        })

        return { success: true }
      } else {
        console.log('❌ AuthContext: Login failed:', response.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error)
      const errorMessage = error.message || 'Login failed. Please try again.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })
      return { success: false, message: errorMessage }
    }
  }, [])

  // ✅ FIXED: Register function
  const register = useCallback(async (userData) => {
    console.log('📝 AuthContext: Registration attempt for', userData.email)
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const response = await authService.register(userData)
      
      if (response.success) {
        console.log('✅ AuthContext: Registration successful')
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false })
        return { success: true, data: response.data }
      } else {
        console.log('❌ AuthContext: Registration failed:', response.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error)
      const errorMessage = error.message || 'Registration failed. Please try again.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })
      return { success: false, message: errorMessage }
    }
  }, [])

  // ✅ FIXED: Verify OTP function
  const verifyOTP = useCallback(async (otpData) => {
    console.log('📧 AuthContext: OTP verification for', otpData.email)
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const response = await authService.verifyOTP(otpData)
      
      if (response.success) {
        const { user, tokens } = response.data
        
        console.log('✅ AuthContext: OTP verification successful')
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: tokens.accessToken },
        })

        return { success: true, user }
      } else {
        console.log('❌ AuthContext: OTP verification failed:', response.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: OTP verification error:', error)
      const errorMessage = error.message || 'OTP verification failed.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })
      return { success: false, message: errorMessage }
    }
  }, [])

  // ✅ FIXED: Logout function
  const logout = useCallback(async () => {
    console.log('👋 AuthContext: Logout initiated')
    
    try {
      await authService.logout()
      console.log('✅ AuthContext: Logout successful')
    } catch (error) {
      console.error('❌ AuthContext: Logout API error:', error)
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }, [])

  // Update profile function
  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await authService.updateProfile(updates)
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE,
          payload: response.data,
        })
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed.'
      return { success: false, message: errorMessage }
    }
  }, [])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('krishi_refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      const response = await authService.refreshToken({ refreshToken })
      
      if (response.success) {
        const newToken = response.data.tokens.accessToken
        
        dispatch({
          type: AUTH_ACTIONS.TOKEN_REFRESH,
          payload: newToken,
        })

        return newToken
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return null
    }
  }, [logout])

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  // Helper functions
  const hasRole = useCallback((role) => state.user?.role === role, [state.user])
  const isFarmer = useCallback(() => hasRole('farmer'), [hasRole])
  const isBuyer = useCallback(() => hasRole('buyer'), [hasRole])
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole])

  // ✅ FIXED: Memoized context value
  const value = React.useMemo(() => ({
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    initializeAuth,
    login,
    register,
    verifyOTP,
    logout,
    updateProfile,
    refreshToken,
    clearError,

    // Helpers
    hasRole,
    isFarmer,
    isBuyer,
    isAdmin,
  }), [
    state.user,
    state.token, 
    state.isAuthenticated,
    state.isLoading,
    state.error,
    initializeAuth,
    login,
    register,
    verifyOTP,
    logout,
    updateProfile,
    refreshToken,
    clearError,
    hasRole,
    isFarmer,
    isBuyer,
    isAdmin
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Export context for advanced use cases
export { AuthContext }
