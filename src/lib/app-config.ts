/**
 * Configuración editable en runtime (pantalla "Configuration"): host del
 * servidor, URLs de Prometheus/node-exporter/cAdvisor/Portainer y la lista
 * de sitios a pingear.
 *
 * `env.ts` (variables `EXPO_PUBLIC_*`) solo se lee al compilar el bundle,
 * así que no sirve para "cambiar el host desde la app". Este módulo guarda
 * overrides en AsyncStorage y los combina con los defaults de `env` — si el
 * usuario nunca tocó un campo, se sigue usando lo que trae el `.env`.
 *
 * Es un store fuera de React (no un Context) a propósito: los clientes de
 * API (prometheus/client.ts, portainer/client.ts, health.ts) son funciones
 * planas que no pueden usar hooks, y necesitan leer la URL vigente en cada
 * llamada. Las pantallas se suscriben con `useAppConfig()`
 * (`@/hooks/use-app-config`), que envuelve este store con `useSyncExternalStore`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PingTarget } from '@/api/ping';
import { env } from '@/constants/env';
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

/** Solo estos campos se pueden editar/guardar desde la pantalla de config. */
export type EditableAppConfig = Omit<AppConfig, 'pingTargets'>;

function envDefaults(): AppConfig {
  return {
    serverHost: env.serverHost,
    prometheusUrl: env.prometheusUrl,
    nodeExporterUrl: env.nodeExporterUrl,
    cadvisorUrl: env.cadvisorUrl,
    portainerUrl: env.portainerUrl,
    portainerApiToken: env.portainerApiToken,
    pingTargets: DEFAULT_PING_TARGETS,
  };
}

/** Normaliza campos opcionales guardados como "" de vuelta a `undefined`. */
function clean(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

let state: AppConfig = envDefaults();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
    console.warn('No se pudo guardar la configuración', error);
  });
}

/** Para `useSyncExternalStore`: registra un listener y devuelve cómo darlo de baja. */
export function subscribeAppConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Snapshot síncrono del estado actual — usado tanto por React como por las funciones planas de `@/api`. */
export function getAppConfig(): AppConfig {
  return state;
}

export function isAppConfigHydrated(): boolean {
  return hydrated;
}

/** Lee el override guardado en AsyncStorage (si existe) y lo mezcla sobre los defaults de `.env`. Llamar una vez al iniciar la app. */
export async function hydrateAppConfig(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppConfig>;
      const defaults = envDefaults();
      state = {
        serverHost: clean(saved.serverHost) ?? defaults.serverHost,
        prometheusUrl: clean(saved.prometheusUrl) ?? defaults.prometheusUrl,
        nodeExporterUrl: clean(saved.nodeExporterUrl) ?? defaults.nodeExporterUrl,
        cadvisorUrl: clean(saved.cadvisorUrl) ?? defaults.cadvisorUrl,
        portainerUrl: clean(saved.portainerUrl),
        portainerApiToken: clean(saved.portainerApiToken),
        pingTargets: Array.isArray(saved.pingTargets) && saved.pingTargets.length > 0
          ? saved.pingTargets
          : defaults.pingTargets,
      };
    }
  } catch (error) {
    console.warn('No se pudo leer la configuración guardada, uso los valores del .env', error);
  } finally {
    hydrated = true;
    emit();
  }
}

/** Guarda host/URLs (todo menos `pingTargets`, que se edita con las funciones de abajo). */
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

/** Borra los overrides guardados y vuelve a lo que diga el `.env`. */
export function resetAppConfig() {
  state = envDefaults();
  emit();
  AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
    console.warn('No se pudo borrar la configuración guardada', error);
  });
}
