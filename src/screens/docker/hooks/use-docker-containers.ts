/** Containers grouped by docker-compose stack, via Portainer. */

import { useQuery } from '@tanstack/react-query';

import { getContainers, groupByProject, isPortainerConfigured } from '@/api';

export function useDockerContainers(refreshIntervalMs: number) {
  return useQuery({
    queryKey: ['docker', 'containers'],
    queryFn: async () => groupByProject(await getContainers()),
    refetchInterval: refreshIntervalMs,
    enabled: isPortainerConfigured(),
  });
}
