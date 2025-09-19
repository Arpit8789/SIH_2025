// src/components/ui/toast.jsx - TOAST BELOW HEADER, SOLID BACKGROUND
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  Loader2
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

// ✅ Hook with fallback
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('⚠️ useToast called without ToastProvider, using console fallback');
    return {
      success: (m) => console.log('✅ SUCCESS:', m),
      error: (m) => console.error('❌ ERROR:', m),
      warning: (m) => console.warn('⚠️ WARNING:', m),
      info: (m) => console.info('ℹ️ INFO:', m),
      loading: (m) => { console.log('🔄 LOADING:', m); return Date.now(); },
      remove: (id) => console.log('🗑️ REMOVE:', id),
      update: (id, msg, t) => console.log('🔄 UPDATE:', t, msg)
    };
  }
  return context;
};

// Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (type !== TOAST_TYPES.LOADING && duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateToast = (id, message, type) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, message, type } : t));
  };

  const toast = {
    success: (m, d) => addToast(m, TOAST_TYPES.SUCCESS, d),
    error: (m, d) => addToast(m, TOAST_TYPES.ERROR, d),
    warning: (m, d) => addToast(m, TOAST_TYPES.WARNING, d),
    info: (m, d) => addToast(m, TOAST_TYPES.INFO, d),
    loading: (m) => addToast(m, TOAST_TYPES.LOADING, 0),
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

// Toast Container -> BELOW HEADER
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="absolute left-0 right-0 top-[64px] z-[9999] flex flex-col items-center space-y-3 px-4">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Single Toast
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
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
          icon: <CheckCircle className="h-5 w-5 text-white" />,
          bgColor: 'bg-green-600',
        };
      case TOAST_TYPES.ERROR:
        return {
          icon: <XCircle className="h-5 w-5 text-white" />,
          bgColor: 'bg-red-600',
        };
      case TOAST_TYPES.WARNING:
        return {
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          bgColor: 'bg-yellow-600',
        };
      case TOAST_TYPES.LOADING:
        return {
          icon: <Loader2 className="h-5 w-5 text-white animate-spin" />,
          bgColor: 'bg-blue-600',
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-white" />,
          bgColor: 'bg-indigo-600',
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`w-full max-w-lg relative rounded-md shadow-md transition-all duration-300 ease-in-out transform text-white
        ${config.bgColor}
        ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
        ${isExiting ? 'scale-95' : 'scale-100'}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0 text-sm font-medium">{toast.message}</div>
        {toast.type !== TOAST_TYPES.LOADING && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default { ToastProvider, useToast, TOAST_TYPES };
