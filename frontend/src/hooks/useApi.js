// src/hooks/useApi.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '@context/NotificationContext';
import { apiHelpers } from '@utils/helpers';

// Generic API hook for all backend calls
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasExecuted, setHasExecuted] = useState(false);
  
  const { showError } = useNotification();
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute API call function
  const execute = useCallback(async (...args) => {
    if (!isMountedRef.current) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setHasExecuted(true);

      const response = await apiFunction(...args);
      
      if (!isMountedRef.current) return;

      // Extract data from backend response
      const extractedData = apiHelpers.extractData(response, null);
      setData(extractedData);

      return { success: true, data: extractedData };
    } catch (err) {
      if (!isMountedRef.current) return;

      // Handle abort error
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }

      const errorMessage = apiHelpers.handleApiError(err, 'API call failed');
      setError(errorMessage);

      // Show error notification if enabled
      if (options.showErrorNotification !== false) {
        showError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, options.showErrorNotification, showError]);

  // Reset hook state
  const reset = useCallback(() => {
    setData(options.initialData || null);
    setLoading(false);
    setError(null);
    setHasExecuted(false);
  }, [options.initialData]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    data,
    loading,
    error,
    hasExecuted,
    execute,
    reset,
    cancel,
    // Helper states
    isSuccess: !loading && !error && hasExecuted,
    isError: !loading && !!error,
    isEmpty: !loading && !error && !data,
  };
};

// Auto-executing API hook for data that should load immediately
export const useApiEffect = (apiFunction, dependencies = [], options = {}) => {
  const apiHook = useApi(apiFunction, options);

  useEffect(() => {
    if (options.skip) return;
    
    apiHook.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return apiHook;
};

export default useApi;
