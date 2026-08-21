/**
 * A container's logs via the Docker Engine API.
 *
 * Docker only returns plain-text logs if the container was created with a
 * TTY (`docker run -t`). Everything else (the vast majority — anything from
 * a docker-compose without `tty: true`) comes back "multiplexed": each
 * frame carries an 8-byte header (1 stream byte + 3 reserved + 4 big-endian
 * size bytes) followed by that many payload bytes. That's why we inspect
 * the container first, to know which format to expect.
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
    if (payloadEnd > buffer.byteLength) break; // incomplete frame, cut it off here

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

/** The last `tailLines` lines of stdout+stderr, with Docker's timestamp. */
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
