/** Availability of Prometheus / node-exporter / cAdvisor. */

import { useQuery } from '@tanstack/react-query';

import { getServicesHealth } from '@/api';

export function useServicesHealth(refreshIntervalMs: number) {
  return useQuery({
    queryKey: ['services', 'health'],
    queryFn: getServicesHealth,
    refetchInterval: refreshIntervalMs,
  });
}
