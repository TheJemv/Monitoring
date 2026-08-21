/** Formas de la Docker Engine API, tal como las devuelve Portainer al hacer de proxy. */

export interface DockerContainerRaw {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Labels: Record<string, string>;
  /** Solo viene si se pide `?size=true`: tamaño de la capa escribible, en bytes. */
  SizeRw?: number;
  /** Solo viene si se pide `?size=true`: tamaño total (capa + imagen base), en bytes. */
  SizeRootFs?: number;
  Created: number;
}

export interface DockerContainerStatsRaw {
  cpu_stats: {
    cpu_usage: { total_usage: number; percpu_usage?: number[] };
    system_cpu_usage?: number;
    online_cpus?: number;
  };
  precpu_stats: {
    cpu_usage: { total_usage: number };
    system_cpu_usage?: number;
  };
  memory_stats: {
    usage?: number;
    limit?: number;
    // En cgroup v2 la página en caché viene como `inactive_file`, no `cache`.
    stats?: { cache?: number; inactive_file?: number };
  };
}

export type ContainerState = 'running' | 'exited' | 'paused' | 'restarting' | 'created' | 'dead' | 'removing';

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  /** Label `com.docker.compose.project`, o "Sin proyecto" si no viene de un docker-compose. */
  project: string;
  /** Label `com.docker.compose.service`, o el nombre del contenedor. */
  service: string;
  state: ContainerState;
  /** Texto de Docker, ej. "Up 3 days" / "Exited (0) 2 hours ago". */
  statusText: string;
  /** null si el contenedor no está corriendo, o no se pudieron leer sus stats. */
  cpuPercent: number | null;
  memoryUsedBytes: number | null;
  memoryLimitBytes: number | null;
  /** Tamaño total en disco (capa + imagen base), en bytes. */
  diskBytes: number | null;
}

export interface ComposeProject {
  name: string;
  containers: ContainerSummary[];
  runningCount: number;
  totalCount: number;
}

/** Solo lo que necesitamos de `/containers/{id}/json` para decidir cómo leer sus logs. */
export interface DockerContainerInspect {
  Config: { Tty: boolean };
}

export interface LogLine {
  stream: 'stdout' | 'stderr';
  text: string;
}
