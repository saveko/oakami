import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before stale
      gcTime: 10 * 60 * 1000, // 10 minutes cache lifetime
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Don't refetch on tab switch (using visibility detection instead)
      refetchOnMount: 'stale',
    },
  },
});
