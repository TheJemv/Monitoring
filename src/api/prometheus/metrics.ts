/**
 * Funciones de alto nivel que traducen las consultas PromQL en datos
 * listos para usar en pantallas (números planos, no la forma cruda de Prometheus).
 */

import { promQuery } from './client';
import { PromQueries } from './queries';
import type { PrometheusVectorResult } from './types';

export interface MemoryUsage {
  usedBytes: number;
  totalBytes: number;
  usedPercent: number;
}

export interface DiskUsage {
  usedBytes: number;
  totalBytes: number;
  usedPercent: number;
}

export interface ContainerMetric {
  name: string;
  value: number;
}

export interface ContainerMetrics {
  /** Uso de CPU por contenedor, en cores. */
  cpu: ContainerMetric[];
  /** Uso de memoria por contenedor, en bytes. */
  memory: ContainerMetric[];
}

function firstValue(results: PrometheusVectorResult[]): number | null {
  const raw = results[0]?.value?.[1];
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

/** % de uso de CPU del host (promedio de todos los cores). */
export async function getCpuUsagePercent(): Promise<number | null> {
  const response = await promQuery(PromQueries.cpuUsagePercent);
  return firstValue(response.data?.result ?? []);
}

/** RAM usada/total del host. */
export async function getMemoryUsage(): Promise<MemoryUsage | null> {
  const [usedRes, totalRes] = await Promise.all([
    promQuery(PromQueries.memoryUsedBytes),
    promQuery(PromQueries.memoryTotalBytes),
  ]);

  const usedBytes = firstValue(usedRes.data?.result ?? []);
  const totalBytes = firstValue(totalRes.data?.result ?? []);
  if (usedBytes === null || !totalBytes) return null;

  return { usedBytes, totalBytes, usedPercent: (usedBytes / totalBytes) * 100 };
}

/** Espacio en disco usado/total de un punto de montaje (ej. "/", "/mnt/storage"). */
export async function getDiskUsage(mountpoint: string): Promise<DiskUsage | null> {
  const [usedRes, totalRes] = await Promise.all([
    promQuery(PromQueries.diskUsedBytes(mountpoint)),
    promQuery(PromQueries.diskTotalBytes(mountpoint)),
  ]);

  const usedBytes = firstValue(usedRes.data?.result ?? []);
  const totalBytes = firstValue(totalRes.data?.result ?? []);
  if (usedBytes === null || !totalBytes) return null;

  return { usedBytes, totalBytes, usedPercent: (usedBytes / totalBytes) * 100 };
}

/**
 * Temperatura máxima entre los sensores hwmon del host, en °C.
 * `null` si el host no expone sensores de temperatura.
 */
export async function getCpuTemperatureCelsius(): Promise<number | null> {
  const response = await promQuery(PromQueries.cpuTemperatureCelsius);
  return firstValue(response.data?.result ?? []);
}

/** Segundos desde el último arranque del host. */
export async function getUptimeSeconds(): Promise<number | null> {
  const response = await promQuery(PromQueries.uptimeSeconds);
  return firstValue(response.data?.result ?? []);
}

/** CPU y memoria por contenedor docker compose, vía cAdvisor. */
export async function getContainerMetrics(): Promise<ContainerMetrics> {
  const [cpuRes, memRes] = await Promise.all([
    promQuery(PromQueries.containerCpuUsage),
    promQuery(PromQueries.containerMemoryUsage),
  ]);

  const toMetrics = (results: PrometheusVectorResult[]): ContainerMetric[] =>
    results
      .filter((result) => result.metric.name)
      .map((result) => ({ name: result.metric.name, value: Number(result.value[1]) }));

  return {
    cpu: toMetrics(cpuRes.data?.result ?? []),
    memory: toMetrics(memRes.data?.result ?? []),
  };
}
