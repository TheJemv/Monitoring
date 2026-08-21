/**
 * Runtime-editable configuration (the "Configuration" screen): server host,
 * Prometheus/node-exporter/cAdvisor/Portainer URLs, and the list of sites to
 * ping.
 *
 * There's no `.env` involved — every value starts blank and is set from the
 * app itself, so the compiled binary never bakes in a personal server URL or
 * token. Overrides are persisted to AsyncStorage.
 *
 * This is a store outside React (not a Context) on purpose: the API clients
 * (prometheus/client.ts, portainer/client.ts, health.ts) are plain functions
 * that can't use hooks, and need to read the current URL on every call.
 * Screens subscribe with `useAppConfig()` (`@/hooks/use-app-config`), which
 * wraps this store with `useSyncExternalStore`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PingTarget } from '@/api/ping';
import { PING_TARGETS as DEFAULT_PING_TARGETS } from '@/screens/ping/ping.constants';

const STORAGE_KEY = 'monitoring-app/config/v1';

export interface AppConfig {
  serverHost: string;
  prometheusUrl: string;
  nodeExporterUrl: string;
  cadvisorUrl: string;
  portainerUrl?: string;
  portainerApiToken?: string;
  pingTargets: PingTarget[];
}

/** Only these fields are editable/savable from the config screen. */
export type EditableAppConfig = Omit<AppConfig, 'pingTargets'>;

function defaults(): AppConfig {
  return {
    serverHost: '',
    prometheusUrl: '',
    nodeExporterUrl: '',
    cadvisorUrl: '',
    portainerUrl: undefined,
    portainerApiToken: undefined,
    pingTargets: DEFAULT_PING_TARGETS,
  };
}

/** Normalizes optional fields saved as `""` back to `undefined`. */
function clean(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

let state: AppConfig = defaults();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
    console.warn('Could not save the configuration', error);
  });
}

/** For `useSyncExternalStore`: registers a listener and returns how to unsubscribe. */
export function subscribeAppConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Synchronous snapshot of the current state — used both by React and by the plain functions in `@/api`. */
export function getAppConfig(): AppConfig {
  return state;
}

export function isAppConfigHydrated(): boolean {
  return hydrated;
}

/** Reads the saved config from AsyncStorage (if any). Call once on app startup. */
export async function hydrateAppConfig(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppConfig>;
      const base = defaults();
      state = {
        serverHost: clean(saved.serverHost) ?? base.serverHost,
        prometheusUrl: clean(saved.prometheusUrl) ?? base.prometheusUrl,
        nodeExporterUrl: clean(saved.nodeExporterUrl) ?? base.nodeExporterUrl,
        cadvisorUrl: clean(saved.cadvisorUrl) ?? base.cadvisorUrl,
        portainerUrl: clean(saved.portainerUrl),
        portainerApiToken: clean(saved.portainerApiToken),
        pingTargets: Array.isArray(saved.pingTargets) ? saved.pingTargets : base.pingTargets,
      };
    }
  } catch (error) {
    console.warn('Could not read the saved configuration, starting from an empty state', error);
  } finally {
    hydrated = true;
    emit();
  }
}

/** Saves host/URLs (everything but `pingTargets`, which is edited with the functions below). */
export function updateAppConfig(patch: EditableAppConfig) {
  state = {
    ...state,
    serverHost: patch.serverHost.trim(),
    prometheusUrl: patch.prometheusUrl.trim(),
    nodeExporterUrl: patch.nodeExporterUrl.trim(),
    cadvisorUrl: patch.cadvisorUrl.trim(),
    portainerUrl: clean(patch.portainerUrl),
    portainerApiToken: clean(patch.portainerApiToken),
  };
  emit();
  persist();
}

export function setPingTargets(targets: PingTarget[]) {
  state = { ...state, pingTargets: targets };
  emit();
  persist();
}

export function addPingTarget(target: PingTarget) {
  if (state.pingTargets.some((existing) => existing.url === target.url)) return;
  setPingTargets([...state.pingTargets, target]);
}

export function removePingTarget(url: string) {
  setPingTargets(state.pingTargets.filter((target) => target.url !== url));
}

/** Clears the saved overrides and goes back to the blank defaults. */
export function resetAppConfig() {
  state = defaults();
  emit();
  AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
    console.warn('Could not clear the saved configuration', error);
  });
}
