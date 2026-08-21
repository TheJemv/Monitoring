/**
 * Chequeo de disponibilidad HTTP para sitios arbitrarios (los que expones
 * vía cloudflared). No es un ping ICMP real — Expo/iOS no lo permite sin
 * salir del sandbox nativo — así que medimos lo mismo que cualquier
 * servicio de "uptime monitoring": si el sitio responde y cuánto tarda.
 */

export interface PingTarget {
  label: string;
  url: string;
}

export interface PingResult {
  label: string;
  url: string;
  /** true si el sitio respondió algo (aunque sea un error HTTP) — false solo si no hubo respuesta. */
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
