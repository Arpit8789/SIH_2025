// src/context/AuthContext.jsx - WITH EXTENSIVE DEBUGGING LOGS
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

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

// Auth reducer
const authReducer = (state, action) => {
  console.log('🔄 AuthReducer: Action =', action.type, action.payload ? 'with payload' : 'no payload')
  
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: action.payload ?? true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      console.log('✅ AuthReducer: LOGIN_SUCCESS with user =', action.payload.user)
      console.log('✅ AuthReducer: User role in reducer =', action.payload.user?.role)
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

  // ✅ Initialize auth with better token verification
  const initializeAuth = useCallback(async () => {
    console.log('🔍 AuthContext: Initializing auth...')
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const token = localStorage.getItem('krishi_access_token')
      const userData = localStorage.getItem('krishi_user_data')

      console.log('🔍 AuthContext: Token exists =', !!token)
      console.log('🔍 AuthContext: UserData exists =', !!userData)

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          console.log('🔍 AuthContext: Stored user =', user)
          console.log('🔍 AuthContext: Stored user role =', user?.role)
          
          const response = await authService.verifyToken()
          
          if (response.success) {
            console.log('✅ AuthContext: Token verified, user authenticated')
            console.log('✅ AuthContext: Auth state user role =', user?.role)
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
        console.log('🔍 AuthContext: No stored credentials')
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

  // ✅ Login function with DETAILED logging
  const login = useCallback(async (credentials) => {
    console.log('🔐 AuthContext: Login attempt for', credentials.email)
    console.log('🔐 AuthContext: Full credentials object =', { email: credentials.email, password: '***' })
    
    const loadingToastId = toast.loading('🔐 Signing you in...')
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      console.log('🔐 AuthContext: Calling authService.login...')
      const response = await authService.login(credentials)
      console.log('🔐 AuthContext: Raw authService response =', response)
      console.log('🔐 AuthContext: Response success =', response?.success)
      console.log('🔐 AuthContext: Response data =', response?.data)
      
      if (response.success) {
        const { user, tokens } = response.data
        console.log('✅ AuthContext: Login successful!')
        console.log('✅ AuthContext: User object =', user)
        console.log('✅ AuthContext: User role =', user?.role)
        console.log('✅ AuthContext: Tokens =', tokens ? 'Present' : 'Missing')
        
        // Update state
        console.log('🔄 AuthContext: Dispatching LOGIN_SUCCESS...')
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: tokens.accessToken },
        })

        console.log('🔄 AuthContext: State updated, current user role =', user?.role)

        // Update loading toast to success
        toast.success(response.message, { id: loadingToastId })

        // ✅ Return user with DETAILED logging
        const returnUser = {
          ...user,
          role: user.role
        }
        console.log('✅ AuthContext: Returning user object =', returnUser)
        console.log('✅ AuthContext: Return user role =', returnUser.role)
        
        const loginResult = { 
          success: true, 
          user: returnUser
        }
        console.log('✅ AuthContext: Final login result =', loginResult)
        
        return loginResult
      } else {
        console.log('❌ AuthContext: Login failed:', response?.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })

        toast.error(response.message, { id: loadingToastId })
        
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error)
      const errorMessage = 'Login failed. Please try again.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })

      toast.error(errorMessage, { id: loadingToastId })
      
      return { success: false, message: errorMessage }
    }
  }, [])

  // ✅ Helper function to get redirect path with EXTENSIVE logging
  // ✅ FIXED: getRedirectPath with case-insensitive role checking
const getRedirectPath = useCallback((user = state.user) => {
  console.log('🎯 AuthContext: getRedirectPath called')
  console.log('🎯 AuthContext: Input user parameter =', user)
  console.log('🎯 AuthContext: State user =', state.user)
  console.log('🎯 AuthContext: Final user to check =', user)
  
  if (!user) {
    console.log('🎯 AuthContext: No user provided, returning default dashboard')
    return '/dashboard'
  }
  
  const role = user.role
  console.log('🎯 AuthContext: Extracted role =', role)
  console.log('🎯 AuthContext: Role type =', typeof role)
  console.log('🎯 AuthContext: Role is truthy =', !!role)
  
  // ✅ FIX: Convert role to lowercase for comparison
  const normalizedRole = role?.toLowerCase()
  console.log('🎯 AuthContext: Normalized role =', normalizedRole)
  
  const paths = {
    'farmer': '/dashboard/farmer',
    'buyer': '/dashboard/buyer',
    'admin': '/dashboard/admin'
  }
  
  console.log('🎯 AuthContext: Available paths =', paths)
  console.log('🎯 AuthContext: Looking for normalized role in paths:', normalizedRole, 'in', Object.keys(paths))
  
  const redirectPath = paths[normalizedRole] || '/dashboard'
  console.log('🎯 AuthContext: Determined redirect path =', redirectPath)
  
  // Additional checks with normalized role
  if (normalizedRole === 'farmer') {
    console.log('🎯 AuthContext: ✅ User is farmer, should redirect to /dashboard/farmer')
  } else if (normalizedRole === 'buyer') {
    console.log('🎯 AuthContext: ✅ User is buyer, should redirect to /dashboard/buyer')  
  } else if (normalizedRole === 'admin') {
    console.log('🎯 AuthContext: ✅ User is admin, should redirect to /dashboard/admin')
  } else {
    console.log('🎯 AuthContext: ⚠️ Unknown role, redirecting to default dashboard')
  }
  
  return redirectPath
}, [state.user])


  // Other functions remain the same...
  const register = useCallback(async (userData) => {
    console.log('📝 AuthContext: Registration attempt for', userData.email)
    const loadingToastId = toast.loading('🌾 Creating your Krishi Sahayak account...')
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const response = await authService.register(userData)
      console.log('📝 AuthContext: Registration response =', response)
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false })

        toast.success(response.message, { id: loadingToastId })
        
        return { 
          success: true, 
          data: {
            ...response.data,
            role: userData.role
          }
        }
      } else {
        console.log('❌ AuthContext: Registration failed:', response.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })

        toast.error(response.message, { id: loadingToastId })
        
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error)
      const errorMessage = 'Registration failed. Please try again.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })

      toast.error(errorMessage, { id: loadingToastId })
      
      return { success: false, message: errorMessage }
    }
  }, [])

  const verifyOTP = useCallback(async (otpData) => {
    console.log('🔢 AuthContext: OTP verification for', otpData.email)
    const loadingToastId = toast.loading('🔢 Verifying your OTP...')
    
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING, payload: true })

      const response = await authService.verifyOTP(otpData)
      console.log('🔢 AuthContext: OTP verification response =', response)
      
      if (response.success) {
        const { user, tokens } = response.data
        console.log('✅ AuthContext: OTP verification successful for user =', user)
        console.log('✅ AuthContext: User role after OTP =', user.role)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: tokens.accessToken },
        })

        toast.success(response.message, { id: loadingToastId })

        return { 
          success: true, 
          user: {
            ...user,
            role: user.role
          }
        }
      } else {
        console.log('❌ AuthContext: OTP verification failed:', response.message)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: response.message,
        })

        toast.error(response.message, { id: loadingToastId })
        
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: OTP verification error:', error)
      const errorMessage = 'OTP verification failed.'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })

      toast.error(errorMessage, { id: loadingToastId })
      
      return { success: false, message: errorMessage }
    }
  }, [])

  const resendOTP = useCallback(async (email) => {
    console.log('📧 AuthContext: Resending OTP to', email)
    const loadingToastId = toast.loading('📧 Sending new OTP...')
    
    try {
      const response = await authService.resendOTP(email)
      console.log('📧 AuthContext: Resend OTP response =', response)
      
      if (response.success) {
        toast.success(response.message, { id: loadingToastId })
      } else {
        toast.error(response.message, { id: loadingToastId })
      }
      
      return response
    } catch (error) {
      console.error('❌ AuthContext: Resend OTP error:', error)
      const errorMessage = 'Failed to send OTP. Please try again.'
      toast.error(errorMessage, { id: loadingToastId })
      return { success: false, message: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    console.log('👋 AuthContext: Logout initiated')
    
    try {
      const response = await authService.logout()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      
      console.log('✅ AuthContext: Logout successful')
      toast.success(response.message)
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error)
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      toast.success('👋 Logged out successfully. See you soon!')
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    console.log('✏️ AuthContext: Updating profile with', updates)
    
    try {
      const response = await authService.updateProfile(updates)
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE,
          payload: response.data,
        })
        toast.success('✅ Profile updated successfully!')
        return { success: true }
      } else {
        toast.error(response.message)
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('❌ AuthContext: Profile update error:', error)
      const errorMessage = 'Profile update failed.'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  }, [])

  const refreshToken = useCallback(async () => {
    console.log('🔄 AuthContext: Refreshing token...')
    
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

        console.log('✅ AuthContext: Token refreshed successfully')
        return newToken
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('❌ AuthContext: Token refresh error:', error)
      logout()
      return null
    }
  }, [logout])

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  const hasRole = useCallback((role) => {
    const userRole = state.user?.role
    const hasRoleResult = userRole === role
    console.log(`🔍 AuthContext: hasRole(${role}) = ${hasRoleResult} (user role: ${userRole})`)
    return hasRoleResult
  }, [state.user])

  const isFarmer = useCallback(() => hasRole('farmer'), [hasRole])
  const isBuyer = useCallback(() => hasRole('buyer'), [hasRole])
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole])

  // Memoized context value
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
    resendOTP,
    logout,
    updateProfile,
    refreshToken,
    clearError,

    // Helpers
    hasRole,
    isFarmer,
    isBuyer,
    isAdmin,
    getRedirectPath,
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
    resendOTP,
    logout,
    updateProfile,
    refreshToken,
    clearError,
    hasRole,
    isFarmer,
    isBuyer,
    isAdmin,
    getRedirectPath
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

export { AuthContext }
