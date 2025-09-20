// src/components/common/ErrorBoundary.jsx - COMPLETELY SELF-CONTAINED
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to backend service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Beautiful fallback UI with inline styles (no external dependencies)
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            {/* Agricultural Error Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '1.5rem',
              animation: 'bounce 2s infinite'
            }}>
              🌾💥
            </div>

            {/* Error Title */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Oops! Something Went Wrong
            </h1>

            {/* Error Description */}
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              {this.props.fallbackMessage || 
               "Don't worry! Our digital farm encountered a small hiccup. We're working to fix it right away."
              }
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#16a34a',
                  border: '2px solid #16a34a',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f0fdf4';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                🔄 Reload Page
              </button>
            </div>

            {/* Krishi Sahayak Branding */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f0fdf4, #ecfccb)',
              borderRadius: '16px',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🌱</span>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  Krishi Sahayak
                </h3>
              </div>
              <p style={{
                color: '#16a34a',
                fontSize: '0.9rem',
                margin: 0
              }}>
                Your trusted farming companion is still here to help! 🚜
              </p>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                textAlign: 'left'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '0.5rem'
                }}>
                  🔧 Development Error Details (Click to expand)
                </summary>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#991b1b',
                  overflowX: 'auto',
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  margin: '0.5rem 0 0 0'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes bounce {
              0%, 20%, 53%, 80%, 100% {
                transform: translate3d(0,0,0);
              }
              40%, 43% {
                transform: translate3d(0, -10px, 0);
              }
              70% {
                transform: translate3d(0, -5px, 0);
              }
              90% {
                transform: translate3d(0, -2px, 0);
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
