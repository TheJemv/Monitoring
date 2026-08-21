import type { PingTarget } from '@/api';

/**
 * Sitios a monitorear por defecto. Se usan como semilla inicial de
 * `AppConfig.pingTargets` (ver `@/lib/app-config`) y como valor de
 * "restablecer" en la pantalla de Configuration — desde ahí el usuario
 * puede agregar o quitar sitios sin tocar código.
 */
export const PING_TARGETS: PingTarget[] = [
  { label: 'Prometheus', url: 'https://prometheus.thejemv.cloud' },
  { label: 'cAdvisor', url: 'https://cadvisor.thejemv.cloud' },
  { label: 'node-exporter', url: 'https://node-exporter.thejemv.cloud' },
  { label: 'Portainer', url: 'https://portainer.thejemv.cloud' },
  
  { label: 'Workly', url: 'https://app.workly.services/' },
  { label: 'Kivo', url: 'https://kivo.thejemv.cloud/' },
  { label: 'Nimly', url: 'https://supabase.platosmart.com/' },
];
