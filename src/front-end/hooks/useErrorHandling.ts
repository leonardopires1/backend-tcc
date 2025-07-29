import { useState, useCallback } from 'react';
import { showUserFriendlyError, safeExecute } from '../services/errorService';

interface UseErrorHandlingReturn {
  error: string | null;
  isLoading: boolean;
  clearError: () => void;
  executeWithErrorHandling: <T>(
    fn: () => Promise<T> | T,
    options?: {
      showToUser?: boolean;
      loadingState?: boolean;
      fallback?: T;
    }
  ) => Promise<T | undefined>;
}

export const useErrorHandling = (): UseErrorHandlingReturn => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T> | T,
    options: {
      showToUser?: boolean;
      loadingState?: boolean;
      fallback?: T;
    } = {}
  ): Promise<T | undefined> => {
    const { showToUser = false, loadingState = false, fallback } = options;

    if (loadingState) {
      setIsLoading(true);
    }
    
    clearError();

    try {
      const result = await safeExecute(fn, fallback, showToUser);
      
      if (loadingState) {
        setIsLoading(false);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      if (showToUser) {
        showUserFriendlyError(errorMessage);
      }
      
      if (loadingState) {
        setIsLoading(false);
      }
      
      return fallback;
    }
  }, [clearError]);

  return {
    error,
    isLoading,
    clearError,
    executeWithErrorHandling,
  };
};

export default useErrorHandling;
