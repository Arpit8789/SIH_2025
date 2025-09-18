// src/App.jsx - WITH ALL PROVIDERS
import React, { Suspense } from 'react'
import AppRouter from '@/router/AppRouter'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Suspense 
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading page..." />
              </div>
            }
          >
            <AppRouter />
          </Suspense>
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
