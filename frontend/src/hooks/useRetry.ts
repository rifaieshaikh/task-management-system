import { useState, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';

/**
 * Configuration for retry logic
 */
interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Hook for implementing retry logic with exponential backoff
 */
export const useRetry = (config: RetryConfig = {}) => {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = config;

  const dispatch = useAppDispatch();
  const [retrying, setRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  /**
   * Execute an async operation with retry logic
   */
  const executeWithRetry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onFailure?: (error: any) => void
    ): Promise<T | null> => {
      let currentAttempt = 0;
      let lastError: any;

      while (currentAttempt < maxAttempts) {
        try {
          setRetrying(true);
          setAttemptCount(currentAttempt + 1);

          const result = await operation();

          setRetrying(false);
          setAttemptCount(0);

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (error) {
          lastError = error;
          currentAttempt++;

          if (currentAttempt < maxAttempts) {
            // Calculate delay with exponential backoff
            const delay = delayMs * Math.pow(backoffMultiplier, currentAttempt - 1);
            
            console.log(
              `Retry attempt ${currentAttempt}/${maxAttempts} after ${delay}ms delay`
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // All attempts failed
      setRetrying(false);
      setAttemptCount(0);

      if (onFailure) {
        onFailure(lastError);
      }

      console.error(
        `Operation failed after ${maxAttempts} attempts:`,
        lastError
      );

      return null;
    },
    [maxAttempts, delayMs, backoffMultiplier]
  );

  /**
   * Retry a failed Redux action
   */
  const retryAction = useCallback(
    async (
      actionCreator: any,
      payload: any,
      onSuccess?: () => void,
      onFailure?: (error: any) => void
    ) => {
      return executeWithRetry(
        () => dispatch(actionCreator(payload)).unwrap(),
        onSuccess,
        onFailure
      );
    },
    [dispatch, executeWithRetry]
  );

  return {
    executeWithRetry,
    retryAction,
    retrying,
    attemptCount,
  };
};

export default useRetry;
