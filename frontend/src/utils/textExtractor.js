import { TRANSLATION_CONFIG } from '../config/languageConfig';

class TextExtractor {
  constructor() {
    this.excludeSelectors = [
      '[data-no-translate]',
      'script',
      'style',
      'noscript',
      'code',
      'pre',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'textarea',
      '[contenteditable="true"]'
    ].join(', ');
  }

  // Extract all translatable text nodes from page
  extractTextNodes() {
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip empty or whitespace-only nodes
          if (!node.textContent || !node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip excluded elements
          const parent = node.parentElement;
          if (parent && parent.matches(this.excludeSelectors)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && text.length > 1) { // Skip single characters
        textNodes.push({
          node: node,
          originalText: text,
          translatedText: null
        });
      }
    }

    return textNodes;
  }

  // Extract text from specific elements by selectors
  extractFromElements(selectors = TRANSLATION_CONFIG.TEXT_NODE_SELECTORS) {
    const elements = [];
    const selectedElements = document.querySelectorAll(selectors);

    selectedElements.forEach((element) => {
      // Skip if element should be excluded
      if (element.matches(this.excludeSelectors)) {
        return;
      }

      const text = element.textContent?.trim();
      if (text && text.length > 1) {
        elements.push({
          element: element,
          originalText: text,
          translatedText: null
        });
      }
    });

    return elements;
  }

  // Update DOM with translated text
  applyTranslations(textMappings) {
    let updatedCount = 0;

    textMappings.forEach((mapping) => {
      try {
        if (mapping.translatedText && mapping.translatedText !== mapping.originalText) {
          if (mapping.node) {
            // For text nodes
            mapping.node.textContent = mapping.translatedText;
          } else if (mapping.element) {
            // For elements
            mapping.element.textContent = mapping.translatedText;
          }
          updatedCount++;
        }
      } catch (error) {
        console.warn('Failed to apply translation:', error, mapping);
      }
    });

    return updatedCount;
  }

  // Batch text extraction for translation service
  prepareBatchTexts(textMappings) {
    return textMappings
      .filter(mapping => mapping.originalText && mapping.originalText.trim())
      .map(mapping => mapping.originalText);
  }

  // Map translated results back to original mappings
  mapTranslationResults(textMappings, translatedTexts) {
    const results = [...textMappings];
    let translationIndex = 0;

    for (let i = 0; i < results.length; i++) {
      if (results[i].originalText && results[i].originalText.trim()) {
        results[i].translatedText = translatedTexts[translationIndex] || results[i].originalText;
        translationIndex++;
      }
    }

    return results;
  }

  // Check if element should skip translation
  shouldSkipElement(element) {
    if (!element) return true;
    
    // Check for skip attributes
    return TRANSLATION_CONFIG.SKIP_ATTRIBUTES.some(attr => {
      if (attr.includes('=')) {
        const [attrName, attrValue] = attr.split('=');
        return element.getAttribute(attrName) === attrValue.replace(/"/g, '');
      }
      return element.hasAttribute(attr);
    });
  }

  // Clean extracted text for better translation
  cleanText(text) {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, ''); // Remove leading/trailing newlines
  }
}

// Export singleton instance
export const textExtractor = new TextExtractor();
