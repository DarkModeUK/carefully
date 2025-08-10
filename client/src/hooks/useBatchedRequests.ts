
import { useCallback, useRef } from 'react';
import { debounce } from '@/utils/performance';

interface BatchRequest {
  id: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export function useBatchedRequests<T>(
  batchFunction: (ids: string[]) => Promise<T[]>,
  delayMs: number = 50
) {
  const batchRef = useRef<BatchRequest[]>([]);

  const processBatch = useCallback(async () => {
    if (batchRef.current.length === 0) return;

    const currentBatch = [...batchRef.current];
    batchRef.current = [];

    const ids = currentBatch.map(req => req.id);

    try {
      const results = await batchFunction(ids);
      currentBatch.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(req => {
        req.reject(error);
      });
    }
  }, [batchFunction]);

  const debouncedProcess = useCallback(
    debounce(processBatch, delayMs),
    [processBatch, delayMs]
  );

  const request = useCallback((id: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      batchRef.current.push({ id, resolve, reject });
      debouncedProcess();
    });
  }, [debouncedProcess]);

  return request;
}
