import type { PingTarget } from '@/api';

/**
 * Default sites to monitor. Empty on purpose — the app ships with no
 * personal infrastructure baked in. Used as the initial seed of
 * `AppConfig.pingTargets` (see `@/lib/app-config`) and as the "reset" value
 * in the Configuration screen; add your own sites from there.
 */
export const PING_TARGETS: PingTarget[] = [];
