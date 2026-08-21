/** Low-level client: Portainer as an authenticated proxy to the Docker Engine API. */

import { getAppConfig } from '@/lib/app-config';

import { ApiError, apiFetch, joinUrl } from '../http';
import { PORTAINER_ENDPOINT_ID } from './constants';

/** true if the user has already configured Portainer (from the Configuration screen). */
export function isPortainerConfigured(): boolean {
  const { portainerUrl, portainerApiToken } = getAppConfig();
  return Boolean(portainerUrl && portainerApiToken);
}

function requireConfig(): { url: string; token: string } {
  const { portainerUrl, portainerApiToken } = getAppConfig();
  if (!portainerUrl || !portainerApiToken) {
    throw new ApiError('Portainer is not set up: add the URL and the access token in the Configuration tab.');
  }
  return { url: portainerUrl, token: portainerApiToken };
}

/** Builds a URL to `/api/endpoints/{id}/docker/...` (the real Docker API, via Portainer). */
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
 * Same as `portainerDockerFetch`, but without assuming JSON — for endpoints
 * like `/logs`, which return a binary stream.
 */
export async function portainerDockerFetchRaw(path: string, timeoutMs = 8000): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(dockerProxyUrl(path), { headers: authHeaders(), signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} while fetching logs`, response.status);
    }
    return await response.arrayBuffer();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Timed out (${timeoutMs}ms) fetching logs`);
    }
    throw new ApiError('Could not connect to Portainer to fetch the logs.');
  } finally {
    clearTimeout(timeout);
  }
}
