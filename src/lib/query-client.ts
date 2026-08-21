/** Cliente único de @tanstack/react-query, compartido por toda la app. */

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
