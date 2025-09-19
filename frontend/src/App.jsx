// src/App.jsx - CLEANED UP (Providers moved to main.jsx)
import React, { Suspense } from 'react'
import AppRouter from '@/router/AppRouter'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-white text-2xl">🌾</span>
              </div>
              <LoadingSpinner size="lg" text="Loading your Krishi Sahayak dashboard..." />
            </div>
          </div>
        }
      >
        <AppRouter />
      </Suspense>
    </div>
  )
}

export default App
