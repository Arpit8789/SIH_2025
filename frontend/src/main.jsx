import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@/styles/globals.css'

// Context Providers
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext' // ✅ Already imported
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
        {/* ✅ LANGUAGE PROVIDER - Already wrapped correctly */}
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    marginTop: '70px',
                    background: '#ff4d4f',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontWeight: 500,
                  },
                  success: {
                    style: {
                      background: '#4BB543',
                      color: '#fff',
                    },
                  },
                  error: {
                    style: {
                      background: '#ff4d4f',
                      color: '#fff',
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
