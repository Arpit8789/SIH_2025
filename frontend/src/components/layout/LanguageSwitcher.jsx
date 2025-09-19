import { useState, useRef, useEffect } from 'react';
import { useLanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { LANGUAGE_OPTIONS } from '../../config/languageConfig';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, setLanguage, isTranslating } = useLanguageContext();
  const { translatePage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle language change
  const handleLanguageChange = async (languageCode) => {
    if (languageCode === currentLanguage.code || isChanging) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    setIsOpen(false);

    try {
      // Set new language
      setLanguage(languageCode);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const toggleDropdown = () => {
    if (!isChanging && !isTranslating) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`language-switcher ${className}`} ref={dropdownRef}>
      <button
        className={`language-switcher-button ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        disabled={isChanging || isTranslating}
        title="Change Language"
      >
        <div className="current-language">
          <span className="language-icon">
            {currentLanguage?.code === 'en' && '🇺🇸'}
            {currentLanguage?.code === 'hi' && '🇮🇳'}
            {currentLanguage?.code === 'pa' && '🇮🇳'}
          </span>
          <span className="language-text">
            {currentLanguage?.label || 'Language'}
          </span>
        </div>
        
        {(isChanging || isTranslating) ? (
          <div className="loading-spinner"></div>
        ) : (
          <svg 
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <path 
              fill="currentColor" 
              d="M4.427 9.573l3.146-3.146a.5.5 0 01.708 0l3.146 3.146a.5.5 0 01-.708.708L8 7.562 5.135 10.427a.5.5 0 01-.708-.708z"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="dropdown-header">
            <span>Select Language</span>
          </div>
          
          <div className="language-options">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language.code}
                className={`language-option ${
                  currentLanguage?.code === language.code ? 'active' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
                disabled={currentLanguage?.code === language.code}
              >
                <span className="option-icon">
                  {language.code === 'en' && '🇺🇸'}
                  {language.code === 'hi' && '🇮🇳'}
                  {language.code === 'pa' && '🇮🇳'}
                </span>
                <div className="option-text">
                  <span className="option-name">{language.name}</span>
                  <span className="option-label">{language.label}</span>
                </div>
                {currentLanguage?.code === language.code && (
                  <span className="active-indicator">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Component Styles */}
      <style jsx>{`
        .language-switcher {
          position: relative;
          display: inline-block;
        }

        .language-switcher-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #374151;
          min-width: 120px;
        }

        .language-switcher-button:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }

        .language-switcher-button.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .language-switcher-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .current-language {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .language-icon {
          font-size: 16px;
        }

        .language-text {
          font-weight: 500;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dropdown-arrow {
          transition: transform 0.2s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          min-width: 200px;
          overflow: hidden;
          animation: dropdownSlideIn 0.15s ease-out;
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 12px 16px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .language-options {
          padding: 4px 0;
        }

        .language-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
          text-align: left;
        }

        .language-option:hover {
          background-color: #f3f4f6;
        }

        .language-option.active {
          background-color: #eff6ff;
          color: #3b82f6;
        }

        .language-option:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .option-icon {
          font-size: 18px;
        }

        .option-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .language-option.active .option-name {
          color: #3b82f6;
        }

        .option-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 1px;
        }

        .active-indicator {
          color: #3b82f6;
          font-weight: bold;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .language-dropdown {
            right: auto;
            left: 0;
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
