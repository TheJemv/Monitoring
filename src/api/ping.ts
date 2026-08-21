/**
 * HTTP availability check for arbitrary sites (the ones you expose via
 * cloudflared). Not a real ICMP ping — Expo/iOS doesn't allow that without
 * leaving the native sandbox — so we measure the same thing any "uptime
 * monitoring" service does: whether the site responds, and how fast.
 */

export interface PingTarget {
  label: string;
  url: string;
}

export interface PingResult {
  label: string;
  url: string;
  /** true if the site responded with anything (even an HTTP error) — false only if there was no response at all. */
  online: boolean;
  statusCode: number | null;
  latencyMs: number | null;
}

async function pingTarget(target: PingTarget, timeoutMs = 8000): Promise<PingResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(target.url, { method: 'GET', signal: controller.signal });
    return {
      label: target.label,
      url: target.url,
      online: true,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return { label: target.label, url: target.url, online: false, statusCode: null, latencyMs: null };
  } finally {
    clearTimeout(timeout);
  }
}

export async function pingTargets(targets: PingTarget[]): Promise<PingResult[]> {
  return Promise.all(targets.map((target) => pingTarget(target)));
}
