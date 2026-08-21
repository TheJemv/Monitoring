import { portainerDockerFetch } from './client';
import type { ComposeProject, ContainerState, ContainerSummary, DockerContainerRaw, DockerContainerStatsRaw } from './types';

function stripLeadingSlash(name: string): string {
  return name.startsWith('/') ? name.slice(1) : name;
}

/**
 * Corre `fn` sobre `items` con un máximo de `limit` en vuelo a la vez.
 * RN (como los navegadores) limita las conexiones simultáneas por host a
 * ~6; con muchos contenedores, disparar todas las peticiones de stats de
 * un jalón hace que las últimas se queden en cola y truenen por timeout
 * antes de si quiera empezar — de ahí los "-" al azar.
 */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function fetchRawContainers(): Promise<DockerContainerRaw[]> {
  return portainerDockerFetch<DockerContainerRaw[]>('/containers/json?all=true&size=true');
}

/** Snapshot único de stats (`?stream=false`). `null` si el contenedor no está corriendo o no responde. */
async function fetchContainerStats(id: string): Promise<DockerContainerStatsRaw | null> {
  try {
    return await portainerDockerFetch<DockerContainerStatsRaw>(`/containers/${id}/stats?stream=false`, 8000);
  } catch {
    return null;
  }
}

/** Mismo cálculo que usa el CLI de Docker para "docker stats". */
function computeCpuPercent(stats: DockerContainerStatsRaw): number | null {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = (stats.cpu_stats.system_cpu_usage ?? 0) - (stats.precpu_stats.system_cpu_usage ?? 0);
  // `!(systemDelta > 0)` también atrapa NaN (si algún campo vino undefined),
  // cosa que `systemDelta <= 0` deja pasar porque NaN <= 0 es false.
  if (!(systemDelta > 0) || !(cpuDelta >= 0)) return null;

  const onlineCpus = stats.cpu_stats.online_cpus ?? stats.cpu_stats.cpu_usage.percpu_usage?.length ?? 1;
  return (cpuDelta / systemDelta) * onlineCpus * 100;
}

/** Igual que "docker stats": resta la memoria en caché para no inflar el uso real. */
function computeMemoryUsedBytes(stats: DockerContainerStatsRaw): number | null {
  const usage = stats.memory_stats.usage;
  if (usage == null) return null;

  const cache = stats.memory_stats.stats?.inactive_file ?? stats.memory_stats.stats?.cache ?? 0;
  return Math.max(0, usage - cache);
}

/** Todos los contenedores (corriendo o detenidos), con sus stats en vivo cuando aplica. */
export async function getContainers(): Promise<ContainerSummary[]> {
  const rawContainers = await fetchRawContainers();

  const stats = await mapWithConcurrency(rawContainers, 5, (container) =>
    container.State === 'running' ? fetchContainerStats(container.Id) : Promise.resolve(null)
  );

  return rawContainers.map((container, index) => {
    const containerStats = stats[index];
    const name = stripLeadingSlash(container.Names[0] ?? container.Id.slice(0, 12));

    return {
      id: container.Id,
      name,
      image: container.Image,
      project: container.Labels['com.docker.compose.project'] || 'Sin proyecto',
      service: container.Labels['com.docker.compose.service'] || name,
      state: container.State as ContainerState,
      statusText: container.Status,
      cpuPercent: containerStats ? computeCpuPercent(containerStats) : null,
      memoryUsedBytes: containerStats ? computeMemoryUsedBytes(containerStats) : null,
      memoryLimitBytes: containerStats?.memory_stats.limit ?? null,
      diskBytes: container.SizeRootFs ?? null,
    };
  });
}

/** Agrupa contenedores por su stack de docker-compose, ordenado alfabéticamente. */
export function groupByProject(containers: ContainerSummary[]): ComposeProject[] {
  const byProject = new Map<string, ContainerSummary[]>();

  for (const container of containers) {
    const list = byProject.get(container.project) ?? [];
    list.push(container);
    byProject.set(container.project, list);
  }

  return Array.from(byProject.entries())
    .map(([name, projectContainers]) => ({
      name,
      containers: projectContainers,
      runningCount: projectContainers.filter((c) => c.state === 'running').length,
      totalCount: projectContainers.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
