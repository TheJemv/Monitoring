import { useQuery } from '@tanstack/react-query';

import { pingTargets } from '@/api';
import { useAppConfig } from '@/hooks/use-app-config';

export function usePingTargets(refreshIntervalMs: number) {
  const { pingTargets: targets } = useAppConfig();

  return useQuery({
    // La lista de URLs entra a la queryKey: si se agrega/quita un sitio en
    // Configuration, react-query lo trata como una query nueva en vez de
    // seguir sirviendo el resultado cacheado de la lista anterior.
    queryKey: ['ping', 'targets', targets],
    queryFn: () => pingTargets(targets),
    refetchInterval: refreshIntervalMs,
  });
}
