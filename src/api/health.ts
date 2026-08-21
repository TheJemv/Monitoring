/** Chequeo simple de disponibilidad de cada servicio del stack (para una pantalla de "estado"). */

import { getAppConfig } from '@/lib/app-config';

import { joinUrl } from './http';

export interface ServiceHealth {
  name: string;
  url: string;
  online: boolean;
  latencyMs: number | null;
}

async function pingMetricsEndpoint(name: string, baseUrl: string, timeoutMs = 5000): Promise<ServiceHealth> {
  const url = joinUrl(baseUrl, '/metrics');
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

/** Estado de los tres servicios del docker-compose (Prometheus, node-exporter, cAdvisor). */
export async function getServicesHealth(): Promise<ServiceHealth[]> {
  const config = getAppConfig();
  return Promise.all([
    pingMetricsEndpoint('Prometheus', config.prometheusUrl),
    pingMetricsEndpoint('node-exporter', config.nodeExporterUrl),
    pingMetricsEndpoint('cAdvisor', config.cadvisorUrl),
  ]);
}
