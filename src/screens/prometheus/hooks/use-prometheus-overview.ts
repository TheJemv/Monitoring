/** Overall host metrics (CPU, RAM, disks, temperature, uptime), refreshed live. */

import { useQuery } from '@tanstack/react-query';

import {
  getCpuTemperatureCelsius,
  getCpuUsagePercent,
  getDiskUsage,
  getMemoryUsage,
  getUptimeSeconds,
  type DiskUsage,
  type MemoryUsage,
} from '@/api';

/** Adjust these mount points to match what your node-exporter reports. */
const SSD_MOUNTPOINT = '/';
const HDD_MOUNTPOINT = '/mnt/storage';

export interface PrometheusOverview {
  cpuPercent: number | null;
  memory: MemoryUsage | null;
  ssdDisk: DiskUsage | null;
  hddDisk: DiskUsage | null;
  temperatureCelsius: number | null;
  uptimeSeconds: number | null;
}

async function fetchOverview(): Promise<PrometheusOverview> {
  const [cpuPercent, memory, ssdDisk, hddDisk, temperatureCelsius, uptimeSeconds] = await Promise.all([
    getCpuUsagePercent(),
    getMemoryUsage(),
    getDiskUsage(SSD_MOUNTPOINT),
    getDiskUsage(HDD_MOUNTPOINT),
    getCpuTemperatureCelsius(),
    getUptimeSeconds(),
  ]);

  return { cpuPercent, memory, ssdDisk, hddDisk, temperatureCelsius, uptimeSeconds };
}

export function usePrometheusOverview(refreshIntervalMs: number) {
  return useQuery({
    queryKey: ['prometheus', 'overview'],
    queryFn: fetchOverview,
    refetchInterval: refreshIntervalMs,
  });
}
