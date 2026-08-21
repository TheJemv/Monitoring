/** Docker Engine API shapes, as returned by Portainer acting as a proxy. */

export interface DockerContainerRaw {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Labels: Record<string, string>;
  /** Only present if `?size=true` was requested: size of the writable layer, in bytes. */
  SizeRw?: number;
  /** Only present if `?size=true` was requested: total size (layer + base image), in bytes. */
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
    // In cgroup v2 the cached page comes as `inactive_file`, not `cache`.
    stats?: { cache?: number; inactive_file?: number };
  };
}

export type ContainerState = 'running' | 'exited' | 'paused' | 'restarting' | 'created' | 'dead' | 'removing';

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  /** Label `com.docker.compose.project`, or "No project" if it isn't from a docker-compose. */
  project: string;
  /** Label `com.docker.compose.service`, or the container's name. */
  service: string;
  state: ContainerState;
  /** Docker's own text, e.g. "Up 3 days" / "Exited (0) 2 hours ago". */
  statusText: string;
  /** null if the container isn't running, or its stats couldn't be read. */
  cpuPercent: number | null;
  memoryUsedBytes: number | null;
  memoryLimitBytes: number | null;
  /** Total size on disk (layer + base image), in bytes. */
  diskBytes: number | null;
}

export interface ComposeProject {
  name: string;
  containers: ContainerSummary[];
  runningCount: number;
  totalCount: number;
}

/** Only what we need from `/containers/{id}/json` to decide how to read its logs. */
export interface DockerContainerInspect {
  Config: { Tty: boolean };
}

export interface LogLine {
  stream: 'stdout' | 'stderr';
  text: string;
}
