import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDataInvalidation } from "./usePreloadData";

/**
 * Hook for optimistic updates to improve perceived performance
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticUserUpdate() {
  const queryClient = useQueryClient();
  const { invalidateUserData } = useDataInvalidation();

  return useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", "/api/user", updates);
      return response.json();
    },
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/auth/user"] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(["/api/auth/user"]);

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData(["/api/auth/user"], {
          ...previousUser,
          ...updates,
        });
      }

      return { previousUser };
    },
    onError: (err, updates, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(["/api/auth/user"], context.previousUser);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      invalidateUserData();
    },
  });
}

/**
 * Hook for optimistic scenario progress updates
 */
export function useOptimisticScenarioUpdate() {
  const queryClient = useQueryClient();
  const { invalidateScenarioProgress } = useDataInvalidation();

  return useMutation({
    mutationFn: async ({ scenarioId, updates }: { scenarioId: string; updates: any }) => {
      const response = await apiRequest("POST", `/api/scenarios/${scenarioId}/complete`, updates);
      return response.json();
    },
    onMutate: async ({ scenarioId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/user/scenarios"] });

      const previousScenarios = queryClient.getQueryData(["/api/user/scenarios"]);

      // Optimistically update scenario progress
      if (previousScenarios && Array.isArray(previousScenarios)) {
        const updatedScenarios = previousScenarios.map((scenario: any) =>
          scenario.scenarioId === scenarioId
            ? { ...scenario, ...updates, updatedAt: new Date().toISOString() }
            : scenario
        );
        queryClient.setQueryData(["/api/user/scenarios"], updatedScenarios);
      }

      return { previousScenarios };
    },
    onError: (err, { scenarioId, updates }, context) => {
      if (context?.previousScenarios) {
        queryClient.setQueryData(["/api/user/scenarios"], context.previousScenarios);
      }
    },
    onSettled: () => {
      invalidateScenarioProgress();
    },
  });
}

/**
 * Hook for batch mutations to reduce server requests
 */
export function useBatchMutation<T, U>(
  mutationFn: (data: T[]) => Promise<U>,
  options?: {
    batchSize?: number;
    debounceMs?: number;
  }
) {
  const { batchSize = 10, debounceMs = 500 } = options || {};
  const queryClient = useQueryClient();

  let batchQueue: T[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (batchQueue.length === 0) return;

    const batch = batchQueue.splice(0, batchSize);
    try {
      await mutationFn(batch);
    } catch (error) {
      console.error("Batch mutation failed:", error);
      throw error;
    }
  };

  const addToBatch = (data: T) => {
    batchQueue.push(data);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(processBatch, debounceMs);

    // Process immediately if batch is full
    if (batchQueue.length >= batchSize) {
      processBatch();
    }
  };

  return { addToBatch, processBatch };
}