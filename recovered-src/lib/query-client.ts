import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure default options for all queries here
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
