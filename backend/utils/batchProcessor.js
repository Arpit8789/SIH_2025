class BatchProcessor {
  constructor() {
    this.defaultConcurrency = 3;
    this.defaultBatchSize = 20;
  }

  // Process array in batches with concurrency control
  async processBatch(items, processor, concurrency = this.defaultConcurrency) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const results = [];
    const chunks = this.chunkArray(items, concurrency);

    for (const chunk of chunks) {
      try {
        // Process chunk items concurrently
        const chunkPromises = chunk.map(async (item, index) => {
          try {
            return await processor(item, index);
          } catch (error) {
            console.error(`Batch item ${index} failed:`, error);
            return item; // Return original item on error
          }
        });

        const chunkResults = await Promise.allSettled(chunkPromises);
        
        // Extract results and handle any rejections
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`Chunk item ${index} failed:`, result.reason);
            results.push(chunk[index]); // Use original item as fallback
          }
        });

        // Small delay between chunks to be gentle on the service
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await this.delay(100);
        }

      } catch (error) {
        console.error('Batch chunk processing failed:', error);
        // Add original items as fallback for failed chunk
        results.push(...chunk);
      }
    }

    return results;
  }

  // Split array into chunks of specified size
  chunkArray(array, size) {
    const chunks = [];
    const arrayItems = [...array]; // Create copy to avoid mutation

    while (arrayItems.length > 0) {
      chunks.push(arrayItems.splice(0, size));
    }

    return chunks;
  }

  // Process with retry logic
  async processWithRetry(items, processor, maxRetries = 3, concurrency = this.defaultConcurrency) {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        return await this.processBatch(items, processor, concurrency);
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Batch processing failed (attempt ${attempt}), retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`Batch processing failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  // Process translation batch specifically
  async processTranslationBatch(texts, translateFunction, options = {}) {
    const {
      concurrency = 5,
      chunkSize = 10,
      retryFailedItems = true,
      maxRetries = 2
    } = options;

    // Filter out empty texts
    const validTexts = texts.filter(text => text && text.trim());
    if (validTexts.length === 0) {
      return texts; // Return original array with empty items
    }

    // Create mapping to preserve original positions
    const textMapping = [];
    let validIndex = 0;

    texts.forEach((text, originalIndex) => {
      if (text && text.trim()) {
        textMapping.push({
          originalIndex,
          validIndex: validIndex++,
          text
        });
      } else {
        textMapping.push({
          originalIndex,
          validIndex: -1,
          text
        });
      }
    });

    try {
      // Process valid texts in batches
      const translatedTexts = await this.processBatch(
        validTexts,
        translateFunction,
        concurrency
      );

      // Map results back to original positions
      const results = new Array(texts.length);
      textMapping.forEach((mapping) => {
        if (mapping.validIndex >= 0) {
          results[mapping.originalIndex] = translatedTexts[mapping.validIndex] || mapping.text;
        } else {
          results[mapping.originalIndex] = mapping.text; // Keep empty/invalid texts as-is
        }
      });

      return results;

    } catch (error) {
      console.error('Translation batch processing failed:', error);
      
      if (retryFailedItems && maxRetries > 0) {
        console.log('Retrying failed translation batch...');
        return await this.processTranslationBatch(texts, translateFunction, {
          ...options,
          maxRetries: maxRetries - 1
        });
      }

      // Return original texts on complete failure
      return texts;
    }
  }

  // Utility: Create delay promise
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility: Calculate optimal batch size based on item size
  calculateOptimalBatchSize(items, targetSizeKB = 100) {
    if (!Array.isArray(items) || items.length === 0) {
      return this.defaultBatchSize;
    }

    // Estimate average item size
    const sampleSize = Math.min(10, items.length);
    const sampleItems = items.slice(0, sampleSize);
    const totalSampleSize = sampleItems.reduce((size, item) => {
      return size + (typeof item === 'string' ? item.length : JSON.stringify(item).length);
    }, 0);

    const averageItemSize = totalSampleSize / sampleSize;
    const targetSizeBytes = targetSizeKB * 1024;
    const optimalBatchSize = Math.floor(targetSizeBytes / averageItemSize);

    // Ensure reasonable bounds
    return Math.max(1, Math.min(optimalBatchSize, 50));
  }

  // Get processing statistics
  getStats(startTime, itemCount, successCount) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const successRate = (successCount / itemCount) * 100;
    const itemsPerSecond = (itemCount / duration) * 1000;

    return {
      duration: `${duration}ms`,
      itemCount,
      successCount,
      failureCount: itemCount - successCount,
      successRate: `${successRate.toFixed(1)}%`,
      throughput: `${itemsPerSecond.toFixed(1)} items/sec`
    };
  }
}

// Export singleton instance
const batchProcessor = new BatchProcessor();

export { batchProcessor, BatchProcessor };
