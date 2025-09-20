// components/chatbot/QuickActions.jsx - Quick Action Buttons
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';

const QuickActions = ({ 
  actions, 
  onActionClick, 
  onClose, 
  currentLanguage,
  isVisible = true 
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {currentLanguage === 'hi' ? 'त्वरित सुझाव' : 
                 currentLanguage === 'pa' ? 'ਤੁਰੰਤ ਸੁਝਾਅ' : 
                 'Quick Actions'}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Close quick actions"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <motion.button
                key={action.action}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onActionClick(action)}
                className="group px-4 py-2 bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 text-sm rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                {/* Extract emoji from action text */}
                <span className="text-base">
                  {action.text.match(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u)?.[0] || '🔸'}
                </span>
                <span className="group-hover:font-medium transition-all">
                  {action.text.replace(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u, '').trim()}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Helper Text */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            {currentLanguage === 'hi' ? 'या सीधे अपना सवाल टाइप करें' : 
             currentLanguage === 'pa' ? 'ਜਾਂ ਸਿੱਧਾ ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰੋ' : 
             'Or type your question directly'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickActions;
