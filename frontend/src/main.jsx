// src/main.jsx - COMPLETE
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@/styles/globals.css'

// Context Providers
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'

// Toast Configuration
import { Toaster } from 'react-hot-toast'

// Error Boundary
import ErrorBoundary from '@/components/common/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                  success: {
                    style: {
                      background: 'hsl(142.1 76.2% 36.3% / 0.1)',
                      color: 'hsl(142.1 76.2% 36.3%)',
                      border: '1px solid hsl(142.1 76.2% 36.3% / 0.2)',
                    },
                  },
                  error: {
                    style: {
                      background: 'hsl(0 84.2% 60.2% / 0.1)',
                      color: 'hsl(0 84.2% 60.2%)',
                      border: '1px solid hsl(0 84.2% 60.2% / 0.2)',
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
