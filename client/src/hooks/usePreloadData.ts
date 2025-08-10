import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to preload critical data for better performance
 * Prefetches commonly accessed data in the background
 */
export function usePreloadData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Preload scenarios list since it's accessed from multiple pages
    queryClient.prefetchQuery({
      queryKey: ["/api/scenarios"],
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Preload user data if authenticated
    const token = document.cookie.includes('connect.sid');
    if (token) {
      queryClient.prefetchQuery({
        queryKey: ["/api/auth/user"],
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      queryClient.prefetchQuery({
        queryKey: ["/api/user/stats"],
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  }, [queryClient]);
}

/**
 * Hook to prefetch related data based on current context
 */
export function usePrefetchRelated(scenarioId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (scenarioId) {
      // Prefetch scenario details
      queryClient.prefetchQuery({
        queryKey: ["/api/scenarios", scenarioId],
        staleTime: 30 * 60 * 1000, // 30 minutes
      });
    }
  }, [scenarioId, queryClient]);
}

/**
 * Hook to invalidate stale data efficiently
 */
export function useDataInvalidation() {
  const queryClient = useQueryClient();

  const invalidateUserData = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/user"],
      type: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["/api/user/stats"],
      type: "active",
    });
  };

  const invalidateScenarioProgress = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/user/scenarios"],
      type: "active",
    });
  };

  return {
    invalidateUserData,
    invalidateScenarioProgress,
  };
}