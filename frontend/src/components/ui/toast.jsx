// src/components/ui/toast.jsx - SAFE TOAST WITH FALLBACK
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  Loader2,
  Wheat
} from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning', 
  INFO: 'info',
  LOADING: 'loading'
};

// ✅ SAFE Hook to use toast with fallback
export const useToast = () => {
  const context = useContext(ToastContext);
  
  // ✅ If no provider, return console fallback instead of throwing error
  if (!context) {
    console.warn('⚠️ useToast called without ToastProvider, using console fallback');
    
    return {
      success: (message, duration) => console.log('✅ SUCCESS:', message),
      error: (message, duration) => console.error('❌ ERROR:', message),
      warning: (message, duration) => console.warn('⚠️ WARNING:', message),
      info: (message, duration) => console.info('ℹ️ INFO:', message),
      loading: (message) => {
        console.log('🔄 LOADING:', message);
        return Date.now(); // Return fake ID
      },
      remove: (id) => console.log('🗑️ REMOVE:', id),
      update: (id, message, type) => console.log('🔄 UPDATE:', type.toUpperCase(), message)
    };
  }
  
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto remove after duration (except loading toasts)
    if (type !== TOAST_TYPES.LOADING && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id; // Return ID for manual removal (useful for loading toasts)
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const updateToast = (id, message, type) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, message, type } : toast
    ));
  };

  // Convenience methods
  const toast = {
    success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
    warning: (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
    info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
    loading: (message) => addToast(message, TOAST_TYPES.LOADING, 0), // No auto-remove
    remove: removeToast,
    update: updateToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastConfig = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case TOAST_TYPES.ERROR:
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case TOAST_TYPES.WARNING:
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case TOAST_TYPES.LOADING:
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />,
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out transform
        ${config.bgColor} ${config.borderColor}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'scale-95' : 'scale-100'}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-2 right-4 opacity-10">
        <Wheat className="h-6 w-6" />
      </div>
      
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-relaxed ${config.textColor}`}>
              {toast.message}
            </p>
          </div>
          
          {/* Close Button */}
          {toast.type !== TOAST_TYPES.LOADING && (
            <button
              onClick={handleRemove}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors ${config.textColor}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Progress Bar for timed toasts */}
        {toast.type !== TOAST_TYPES.LOADING && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white/40 transition-all ease-linear"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      {/* Custom CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default { ToastProvider, useToast, TOAST_TYPES };
