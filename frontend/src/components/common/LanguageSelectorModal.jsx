import { useState, useEffect } from 'react';
import { useLanguageContext } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../config/languageConfig';

const LanguageSelectorModal = ({ isOpen, onClose }) => {
  const { setLanguage, hasSelectedLanguage } = useLanguageContext();
  const [selectedLang, setSelectedLang] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Show modal automatically if no language has been selected
  useEffect(() => {
    if (!hasSelectedLanguage) {
      setIsVisible(true);
    }
  }, [hasSelectedLanguage]);

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    setSelectedLang(languageCode);
    
    // Immediate visual feedback
    setTimeout(() => {
      setLanguage(languageCode);
      setIsVisible(false);
      
      if (onClose) {
        onClose();
      }
    }, 200);
  };

  // Prevent closing modal until language is selected
  const handleBackdropClick = (e) => {
    e.preventDefault();
    // Do nothing - force user to select a language
  };

  // Don't render if not visible
  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <div className="language-modal-overlay" onClick={handleBackdropClick}>
      <div className="language-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="language-modal-header">
          <h2 className="language-modal-title">
            Choose Your Language
          </h2>
          <p className="language-modal-subtitle">
            Select your preferred language to continue
          </p>
        </div>

        <div className="language-modal-body">
          <div className="language-options">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language.code}
                className={`language-option ${
                  selectedLang === language.code ? 'selected' : ''
                }`}
                onClick={() => handleLanguageSelect(language.code)}
                disabled={selectedLang && selectedLang !== language.code}
              >
                <div className="language-icon">
                  {language.code === 'en' && '🇺🇸'}
                  {language.code === 'hi' && '🇮🇳'}
                  {language.code === 'pa' && '🇮🇳'}
                </div>
                <div className="language-info">
                  <span className="language-name">{language.name}</span>
                  <span className="language-label">{language.label}</span>
                </div>
                {selectedLang === language.code && (
                  <div className="selection-indicator">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="language-modal-footer">
          <p className="modal-note">
            You can change this language anytime from the settings
          </p>
        </div>
      </div>

      {/* Modal Styles */}
      <style jsx>{`
        .language-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .language-modal-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .language-modal-header {
          padding: 32px 32px 16px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .language-modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .language-modal-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .language-modal-body {
          padding: 24px 32px;
        }

        .language-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .language-option:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
          transform: translateY(-1px);
        }

        .language-option.selected {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .language-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .language-icon {
          font-size: 24px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .language-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .language-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .language-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .selection-indicator {
          color: #3b82f6;
          font-size: 20px;
          font-weight: bold;
        }

        .language-modal-footer {
          padding: 16px 32px 32px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .modal-note {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        @media (max-width: 640px) {
          .language-modal-container {
            margin: 20px;
            max-width: calc(100vw - 40px);
          }
          
          .language-modal-header,
          .language-modal-body,
          .language-modal-footer {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelectorModal;
