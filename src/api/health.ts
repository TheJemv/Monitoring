/** Simple availability check for each service in the stack (for a "status" screen). */

import { getAppConfig } from '@/lib/app-config';

import { joinUrl } from './http';

export interface ServiceHealth {
  name: string;
  url: string;
  online: boolean;
  latencyMs: number | null;
}

async function pingEndpoint(name: string, baseUrl: string, path: string, timeoutMs = 5000): Promise<ServiceHealth> {
  const url = joinUrl(baseUrl, path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, { signal: controller.signal });
    return { name, url, online: response.ok, latencyMs: Date.now() - startedAt };
  } catch {
    return { name, url, online: false, latencyMs: null };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Status of the docker-compose services: Prometheus, node-exporter and
 * cAdvisor always (they're required), plus Portainer when it's configured.
 * Portainer is checked against `/api/status` — a public, unauthenticated
 * endpoint — instead of `/metrics`, which Portainer CE doesn't expose.
 */
export async function getServicesHealth(): Promise<ServiceHealth[]> {
  const config = getAppConfig();
  const checks = [
    pingEndpoint('Prometheus', config.prometheusUrl, '/metrics'),
    pingEndpoint('node-exporter', config.nodeExporterUrl, '/metrics'),
    pingEndpoint('cAdvisor', config.cadvisorUrl, '/metrics'),
  ];

  if (config.portainerUrl) {
    checks.push(pingEndpoint('Portainer', config.portainerUrl, '/api/status'));
  }

  return Promise.all(checks);
}
