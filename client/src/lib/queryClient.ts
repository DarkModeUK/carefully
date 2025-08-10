import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 2; // Reduce retries
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Enable background refetching
      refetchInterval: 1000 * 60 * 15, // 15 minutes for important data
      // Optimize network requests
      networkMode: 'online',
      refetchOnMount: false,
      refetchInterval: false,
      // Dedupe identical queries
      structuralSharing: true,
    },
    mutations: {
      // Add optimistic updates for better perceived performance
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
      },
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('5') || error?.name === 'NetworkError') {
          return failureCount < 1;
        }
        return false;
      },
    },
  },
});