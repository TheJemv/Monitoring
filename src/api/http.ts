/**
 * Wrapper genérico sobre `fetch` para hablar con las APIs del servidor
 * (Prometheus, node-exporter, cAdvisor): agrega timeout y errores tipados.
 */

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  /** Milisegundos antes de abortar la petición. Default: 8000. */
  timeoutMs?: number;
}

/**
 * Une una base URL con un path SIN perder el path que ya traiga la base.
 * `new URL(path, base)` no sirve para esto: si `path` empieza con "/",
 * la spec de URL lo trata como ruta absoluta y descarta el path de `base`
 * (ej. `new URL('/api', 'https://x.com/prometheus')` → "https://x.com/api",
 * se pierde el "/prometheus"). Útil si algún día vuelves a exponer un
 * servicio bajo un subpath en vez de un subdominio propio.
 */
export function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

function extractErrorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'error' in body) {
    const { error } = body as { error: unknown };
    if (typeof error === 'string') return error;
  }
  return undefined;
}

export async function apiFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 8000, ...init } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Tiempo de espera agotado (${timeoutMs}ms) al llamar a ${url}`);
    }
    throw new ApiError(`No se pudo conectar con ${url}. Revisa que el servidor esté encendido y en la misma red.`);
  } finally {
    clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} al llamar a ${url}`, response.status);
    }
    throw new ApiError(`Respuesta inesperada (no JSON) de ${url}`);
  }

  const body = (await response.json()) as T;

  if (!response.ok) {
    // Prometheus (y otras APIs) suelen incluir un mensaje útil en el body aun en error.
    throw new ApiError(extractErrorMessage(body) ?? `Error ${response.status} al llamar a ${url}`, response.status);
  }

  return body;
}
