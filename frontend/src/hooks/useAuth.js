// src/hooks/useAuth.js - ADD DEBUGGING
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export const useAuth = () => {
  console.log('🔐 useAuth: Hook called');
  
  try {
    const context = useContext(AuthContext)
    console.log('🔐 useAuth: Context retrieved =', context);
    
    if (!context) {
      console.error('❌ useAuth: Context is null - AuthProvider missing');
      throw new Error('useAuth must be used within an AuthProvider')
    }
    
    console.log('🔐 useAuth: Returning context successfully');
    return context
  } catch (error) {
    console.error('❌ useAuth: Error =', error);
    throw error;
  }
}


export default useAuth
