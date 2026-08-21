import { useQuery } from '@tanstack/react-query';

import { pingTargets } from '@/api';
import { useAppConfig } from '@/hooks/use-app-config';

export function usePingTargets(refreshIntervalMs: number) {
  const { pingTargets: targets } = useAppConfig();

  return useQuery({
    // The list of URLs goes into the queryKey: if a site is added/removed
    // in Configuration, react-query treats it as a brand-new query instead
    // of serving the cached result for the previous list.
    queryKey: ['ping', 'targets', targets],
    queryFn: () => pingTargets(targets),
    refetchInterval: refreshIntervalMs,
  });
}
