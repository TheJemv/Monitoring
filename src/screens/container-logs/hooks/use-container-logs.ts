import { useQuery } from '@tanstack/react-query';

import { getContainerLogs } from '@/api';

const REFRESH_INTERVAL_MS = 5000;

export function useContainerLogs(containerId: string | undefined) {
  return useQuery({
    queryKey: ['docker', 'logs', containerId],
    queryFn: () => getContainerLogs(containerId as string),
    refetchInterval: REFRESH_INTERVAL_MS,
    enabled: Boolean(containerId),
  });
}
