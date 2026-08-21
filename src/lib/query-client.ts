/** Single @tanstack/react-query client, shared across the app. */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2000,
      refetchOnReconnect: true,
    },
  },
});
