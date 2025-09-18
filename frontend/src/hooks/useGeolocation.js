// src/hooks/useGeolocation.js
import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@context/NotificationContext';

// Geolocation hook for farmer location services
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const { showError, showInfo } = useNotification();

  // Check geolocation support
  useEffect(() => {
    setIsSupported('geolocation' in navigator);
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      showError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 300000, // 5 minutes
          }
        );
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp),
      };

      setLocation(locationData);
      
      if (options.showSuccessNotification !== false) {
        showInfo('Location detected successfully! 📍');
      }

      return locationData;
    } catch (err) {
      let errorMessage = 'Failed to get location';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
        default:
          errorMessage = err.message || 'Unknown location error';
          break;
      }

      setError(errorMessage);
      
      if (options.showErrorNotification !== false) {
        showError(errorMessage);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [isSupported, options, showError, showInfo]);

  // Watch position (for real-time tracking)
  const watchPosition = useCallback(() => {
    if (!isSupported) return null;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };
        setLocation(locationData);
      },
      (err) => {
        setError(err.message);
        showError(`Location tracking error: ${err.message}`);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSupported, options, showError]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (options.autoGet && isSupported) {
      getCurrentPosition();
    }
  }, [options.autoGet, isSupported, getCurrentPosition]);

  return {
    location,
    error,
    loading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearLocation,
    hasLocation: !!location,
  };
};

export default useGeolocation;
