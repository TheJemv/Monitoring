/**
 * High-level functions that translate PromQL queries into data that's
 * ready to use in screens (plain numbers, not Prometheus's raw shape).
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
  /** CPU usage per container, in cores. */
  cpu: ContainerMetric[];
  /** Memory usage per container, in bytes. */
  memory: ContainerMetric[];
}

function firstValue(results: PrometheusVectorResult[]): number | null {
  const raw = results[0]?.value?.[1];
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

/** Host CPU usage % (average across all cores). */
export async function getCpuUsagePercent(): Promise<number | null> {
  const response = await promQuery(PromQueries.cpuUsagePercent);
  return firstValue(response.data?.result ?? []);
}

/** Host RAM used/total. */
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

/** Disk space used/total for a mount point (e.g. "/", "/mnt/storage"). */
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
 * Highest temperature among the host's hwmon sensors, in °C.
 * `null` if the host doesn't expose temperature sensors.
 */
export async function getCpuTemperatureCelsius(): Promise<number | null> {
  const response = await promQuery(PromQueries.cpuTemperatureCelsius);
  return firstValue(response.data?.result ?? []);
}

/** Seconds since the host's last boot. */
export async function getUptimeSeconds(): Promise<number | null> {
  const response = await promQuery(PromQueries.uptimeSeconds);
  return firstValue(response.data?.result ?? []);
}

/** CPU and memory per docker-compose container, via cAdvisor. */
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
