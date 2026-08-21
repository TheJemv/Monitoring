/**
 * Consultas PromQL reutilizables contra las métricas que expone el stack:
 * node-exporter (host) y cAdvisor (contenedores docker compose).
 */

export const PromQueries = {
  /** % de uso de CPU promedio de todos los cores, último minuto. */
  cpuUsagePercent: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`,

  /** Memoria RAM usada, en bytes (total - disponible). */
  memoryUsedBytes: `node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes`,
  /** Memoria RAM total, en bytes. */
  memoryTotalBytes: `node_memory_MemTotal_bytes`,
  /** Memoria RAM usada, en GiB (para graficar contra la RAM total real del servidor). */
  memoryUsedGiB: `(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / (1024 * 1024 * 1024)`,

  /** Espacio usado en un punto de montaje dado (ej. "/", "/mnt/storage"), en bytes. */
  diskUsedBytes: (mountpoint: string) =>
    `node_filesystem_size_bytes{mountpoint="${mountpoint}",fstype!="rootfs"} - node_filesystem_avail_bytes{mountpoint="${mountpoint}",fstype!="rootfs"}`,
  /** Espacio total en un punto de montaje dado, en bytes. */
  diskTotalBytes: (mountpoint: string) =>
    `node_filesystem_size_bytes{mountpoint="${mountpoint}",fstype!="rootfs"}`,

  /**
   * Temperatura máxima del sensor de CPU (no de motherboard).
   * node-exporter expone TODOS los chips hwmon (CPU, board, etc.) en
   * `node_hwmon_temp_celsius`; esto lo cruza con `node_hwmon_chip_names`
   * para quedarnos solo con el chip del procesador (Intel `coretemp`,
   * AMD `k10temp`/`zenpower`).
   *
   * Si tu servidor usa otro driver de sensores para la CPU, revisa los
   * nombres reales con `curl http://<ip>:9100/metrics | grep hwmon_chip_names`
   * y ajusta el regex de `chip_name` aquí.
   */
  cpuTemperatureCelsius: `max(node_hwmon_temp_celsius * on(chip) group_left() (node_hwmon_chip_names{chip_name=~"coretemp|k10temp|zenpower"} * 0 + 1))`,

  /** Segundos desde el último arranque del host. */
  uptimeSeconds: `node_time_seconds - node_boot_time_seconds`,

  /** CPU (cores) por contenedor, último minuto, vía cAdvisor. */
  containerCpuUsage: `sum by (name) (rate(container_cpu_usage_seconds_total{name!=""}[1m]))`,

  /** Memoria usada (bytes) por contenedor, vía cAdvisor. */
  containerMemoryUsage: `sum by (name) (container_memory_usage_bytes{name!=""})`,
} as const;
