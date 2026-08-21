/** Cliente de bajo nivel: Portainer como proxy autenticado hacia la Docker Engine API. */

import { getAppConfig } from '@/lib/app-config';

import { ApiError, apiFetch, joinUrl } from '../http';
import { PORTAINER_ENDPOINT_ID } from './constants';

/** true si el usuario ya configuró Portainer (en el `.env` o desde la pantalla de Configuration). */
export function isPortainerConfigured(): boolean {
  const { portainerUrl, portainerApiToken } = getAppConfig();
  return Boolean(portainerUrl && portainerApiToken);
}

function requireConfig(): { url: string; token: string } {
  const { portainerUrl, portainerApiToken } = getAppConfig();
  if (!portainerUrl || !portainerApiToken) {
    throw new ApiError(
      'Falta configurar Portainer: agrega la URL y el access token en la pestaña de Configuration (o en tu .env).'
    );
  }
  return { url: portainerUrl, token: portainerApiToken };
}

/** Construye una URL hacia `/api/endpoints/{id}/docker/...` (la Docker API real, vía Portainer). */
function dockerProxyUrl(path: string): string {
  const { url } = requireConfig();
  return joinUrl(url, `/api/endpoints/${PORTAINER_ENDPOINT_ID}/docker${path}`);
}

function authHeaders(): HeadersInit {
  const { token } = requireConfig();
  return { 'X-API-Key': token };
}

export async function portainerDockerFetch<T>(path: string, timeoutMs?: number): Promise<T> {
  return apiFetch<T>(dockerProxyUrl(path), { headers: authHeaders(), timeoutMs });
}

/**
 * Igual que `portainerDockerFetch`, pero sin asumir JSON — para endpoints
 * como `/logs`, que devuelven un stream binario.
 */
export async function portainerDockerFetchRaw(path: string, timeoutMs = 8000): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(dockerProxyUrl(path), { headers: authHeaders(), signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} al pedir logs`, response.status);
    }
    return await response.arrayBuffer();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Tiempo de espera agotado (${timeoutMs}ms) al pedir logs`);
    }
    throw new ApiError('No se pudo conectar con Portainer para pedir los logs.');
  } finally {
    clearTimeout(timeout);
  }
}
