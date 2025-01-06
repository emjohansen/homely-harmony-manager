import { useState } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
}

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxAttempts = 3, delayMs = 1000 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        setIsRetrying(attempts > 0);
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, error);
        
        if (attempts === maxAttempts) {
          setIsRetrying(false);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs * attempts));
      }
    }

    // TypeScript requires this even though it's unreachable
    throw new Error('Max retry attempts reached');
  };

  return { executeWithRetry, isRetrying };
};