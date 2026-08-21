/**
 * Logs de un contenedor vía la Docker Engine API.
 *
 * Docker devuelve los logs en texto plano SOLO si el contenedor se creó con
 * TTY (`docker run -t`). El resto (la inmensa mayoría — todo lo que sale de
 * un docker-compose sin `tty: true`) viene "multiplexado": cada frame trae
 * un header de 8 bytes (1 byte de stream + 3 reservados + 4 bytes de tamaño
 * en big-endian) seguido de esos bytes de payload. Por eso primero
 * inspeccionamos el contenedor para saber qué formato esperar.
 * https://docs.docker.com/reference/api/engine/version/v1.41/#tag/Container/operation/ContainerAttach
 */

import { portainerDockerFetch, portainerDockerFetchRaw } from './client';
import type { DockerContainerInspect, LogLine } from './types';

const DEFAULT_TAIL_LINES = 300;

async function isTtyContainer(id: string): Promise<boolean> {
  const inspect = await portainerDockerFetch<DockerContainerInspect>(`/containers/${id}/json`);
  return Boolean(inspect.Config?.Tty);
}

const STREAM_BY_BYTE: Record<number, LogLine['stream']> = { 1: 'stdout', 2: 'stderr' };

function linesFromText(stream: LogLine['stream'], text: string): LogLine[] {
  return text
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => ({ stream, text: line }));
}

function demuxDockerLogStream(buffer: ArrayBuffer): LogLine[] {
  const view = new DataView(buffer);
  const decoder = new TextDecoder('utf-8');
  const lines: LogLine[] = [];
  let offset = 0;

  while (offset + 8 <= buffer.byteLength) {
    const streamByte = view.getUint8(offset);
    const size = view.getUint32(offset + 4, false);
    const payloadStart = offset + 8;
    const payloadEnd = payloadStart + size;
    if (payloadEnd > buffer.byteLength) break; // frame incompleto, lo cortamos ahí

    const stream = STREAM_BY_BYTE[streamByte] ?? 'stdout';
    const text = decoder.decode(buffer.slice(payloadStart, payloadEnd));
    lines.push(...linesFromText(stream, text));

    offset = payloadEnd;
  }

  return lines;
}

function splitRawLogStream(buffer: ArrayBuffer): LogLine[] {
  const text = new TextDecoder('utf-8').decode(buffer);
  return linesFromText('stdout', text);
}

/** Últimas `tailLines` líneas de stdout+stderr, con timestamp de Docker. */
export async function getContainerLogs(id: string, tailLines = DEFAULT_TAIL_LINES): Promise<LogLine[]> {
  const [tty, buffer] = await Promise.all([
    isTtyContainer(id),
    portainerDockerFetchRaw(
      `/containers/${id}/logs?stdout=true&stderr=true&timestamps=true&tail=${tailLines}`,
      10000
    ),
  ]);

  return tty ? splitRawLogStream(buffer) : demuxDockerLogStream(buffer);
}
