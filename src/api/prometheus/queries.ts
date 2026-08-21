/**
 * Reusable PromQL queries against the metrics the stack exposes:
 * node-exporter (host) and cAdvisor (docker-compose containers).
 */

export const PromQueries = {
  /** Average CPU usage % across all cores, last minute. */
  cpuUsagePercent: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`,

  /** RAM used, in bytes (total - available). */
  memoryUsedBytes: `node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes`,
  /** Total RAM, in bytes. */
  memoryTotalBytes: `node_memory_MemTotal_bytes`,
  /** RAM used, in GiB (to plot against the server's actual total RAM). */
  memoryUsedGiB: `(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / (1024 * 1024 * 1024)`,

  /** Used space on a given mount point (e.g. "/", "/mnt/storage"), in bytes. */
  diskUsedBytes: (mountpoint: string) =>
    `node_filesystem_size_bytes{mountpoint="${mountpoint}",fstype!="rootfs"} - node_filesystem_avail_bytes{mountpoint="${mountpoint}",fstype!="rootfs"}`,
  /** Total space on a given mount point, in bytes. */
  diskTotalBytes: (mountpoint: string) =>
    `node_filesystem_size_bytes{mountpoint="${mountpoint}",fstype!="rootfs"}`,

  /**
   * Highest reading from the CPU temperature sensor (not the motherboard's).
   * node-exporter exposes ALL hwmon chips (CPU, board, etc.) under
   * `node_hwmon_temp_celsius`; this joins it with `node_hwmon_chip_names`
   * to keep only the processor's chip (Intel `coretemp`, AMD
   * `k10temp`/`zenpower`).
   *
   * If your server uses a different sensor driver for the CPU, check the
   * real names with `curl http://<ip>:9100/metrics | grep hwmon_chip_names`
   * and adjust the `chip_name` regex here.
   */
  cpuTemperatureCelsius: `max(node_hwmon_temp_celsius * on(chip) group_left() (node_hwmon_chip_names{chip_name=~"coretemp|k10temp|zenpower"} * 0 + 1))`,

  /** Seconds since the host's last boot. */
  uptimeSeconds: `node_time_seconds - node_boot_time_seconds`,

  /** CPU (cores) per container, last minute, via cAdvisor. */
  containerCpuUsage: `sum by (name) (rate(container_cpu_usage_seconds_total{name!=""}[1m]))`,

  /** Memory used (bytes) per container, via cAdvisor. */
  containerMemoryUsage: `sum by (name) (container_memory_usage_bytes{name!=""})`,
} as const;
