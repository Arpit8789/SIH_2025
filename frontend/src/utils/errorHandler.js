class TranslationErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  // Handle translation API errors
  handleTranslationError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: 'TRANSLATION_ERROR',
      message: error.message || 'Unknown translation error',
      context: context,
      stack: error.stack
    };

    this.logError(errorInfo);

    // Return appropriate fallback based on error type
    if (error.message?.includes('Network')) {
      return this.handleNetworkError(context);
    }
    
    if (error.message?.includes('timeout')) {
      return this.handleTimeoutError(context);
    }
    
    if (error.message?.includes('unsupported')) {
      return this.handleUnsupportedLanguageError(context);
    }

    return this.handleGenericError(context);
  }

  // Handle LibreTranslate service errors
  handleServiceError(response, requestData = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: 'SERVICE_ERROR',
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      requestData: requestData
    };

    this.logError(errorInfo);

    switch (response.status) {
      case 400:
        return { error: 'Invalid translation request', fallback: true };
      case 429:
        return { error: 'Rate limit exceeded', fallback: true, retry: true };
      case 500:
        return { error: 'LibreTranslate server error', fallback: true };
      case 503:
        return { error: 'LibreTranslate service unavailable', fallback: true };
      default:
        return { error: 'Translation service error', fallback: true };
    }
  }

  // Handle DOM manipulation errors
  handleDOMError(error, element = null) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: 'DOM_ERROR',
      message: error.message,
      elementTag: element?.tagName,
      elementId: element?.id,
      elementClass: element?.className
    };

    this.logError(errorInfo);
    
    // Continue execution, just skip this element
    return { continue: true, skipElement: true };
  }

  // Handle network connectivity errors
  handleNetworkError(context) {
    return {
      error: 'Network connection failed',
      message: 'Please check your internet connection and LibreTranslate service',
      fallback: context.originalText || '',
      shouldRetry: true,
      retryDelay: 5000
    };
  }

  // Handle request timeout errors
  handleTimeoutError(context) {
    return {
      error: 'Translation request timed out',
      message: 'LibreTranslate service is responding slowly',
      fallback: context.originalText || '',
      shouldRetry: true,
      retryDelay: 3000
    };
  }

  // Handle unsupported language pair errors
  handleUnsupportedLanguageError(context) {
    return {
      error: 'Unsupported language pair',
      message: `Translation from ${context.sourceLanguage} to ${context.targetLanguage} is not available`,
      fallback: context.originalText || '',
      shouldRetry: false
    };
  }

  // Handle generic errors
  handleGenericError(context) {
    return {
      error: 'Translation failed',
      message: 'An unexpected error occurred during translation',
      fallback: context.originalText || '',
      shouldRetry: false
    };
  }

  // Log error to internal log
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation Error:', errorInfo);
    }
  }

  // Get recent errors for debugging
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  // Check if should retry based on error type
  shouldRetry(error, attemptCount = 0) {
    const maxRetries = 3;
    
    if (attemptCount >= maxRetries) {
      return false;
    }

    // Retry network and timeout errors
    if (error.type === 'TRANSLATION_ERROR') {
      return error.message?.includes('Network') || error.message?.includes('timeout');
    }

    // Retry 429 (rate limit) and 503 (service unavailable)
    if (error.type === 'SERVICE_ERROR') {
      return error.status === 429 || error.status === 503;
    }

    return false;
  }

  // Get retry delay based on error type
  getRetryDelay(error, attemptCount = 0) {
    const baseDelay = 1000;
    const backoffMultiplier = Math.pow(2, attemptCount);
    
    if (error.status === 429) {
      return baseDelay * backoffMultiplier * 2; // Longer delay for rate limits
    }
    
    return baseDelay * backoffMultiplier;
  }

  // Clear error log
  clearErrors() {
    this.errorLog = [];
  }

  // Show user-friendly error notification
  showUserError(error) {
    // This can be integrated with your notification system
    const userMessage = error.message || 'Translation temporarily unavailable';
    
    // For now, just console log in a user-friendly way
    console.info('Translation Notice:', userMessage);
    
    // You can integrate this with toast notifications, modals, etc.
    return userMessage;
  }
}

// Export singleton instance
export const errorHandler = new TranslationErrorHandler();
