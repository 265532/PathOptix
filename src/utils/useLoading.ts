import { useState, useEffect, useCallback } from 'react';
import { loadingStateManager } from '../services/api/loadingState';

export interface LoadingHookResult {
  isLoading: boolean;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoading = (): LoadingHookResult => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    loadingStateManager.increment();
    try {
      return await promise;
    } finally {
      loadingStateManager.decrement();
    }
  }, []);

  return { isLoading, withLoading };
};
