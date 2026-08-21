/**
 * Generic wrapper around `fetch` for talking to the server's APIs
 * (Prometheus, node-exporter, cAdvisor): adds a timeout and typed errors.
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
  /** Milliseconds before aborting the request. Default: 8000. */
  timeoutMs?: number;
}

/**
 * Joins a base URL with a path WITHOUT losing any path the base already
 * has. `new URL(path, base)` doesn't work for this: if `path` starts with
 * "/", the URL spec treats it as absolute and drops the base's path
 * (e.g. `new URL('/api', 'https://x.com/prometheus')` → "https://x.com/api",
 * losing the "/prometheus"). Useful if you ever expose a service under a
 * subpath instead of its own subdomain.
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
      throw new ApiError(`Timed out (${timeoutMs}ms) calling ${url}`);
    }
    throw new ApiError(`Could not connect to ${url}. Check that the server is on and reachable.`);
  } finally {
    clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} calling ${url}`, response.status);
    }
    throw new ApiError(`Unexpected (non-JSON) response from ${url}`);
  }

  const body = (await response.json()) as T;

  if (!response.ok) {
    // Prometheus (and other APIs) usually include a useful message in the body even on error.
    throw new ApiError(extractErrorMessage(body) ?? `Error ${response.status} calling ${url}`, response.status);
  }

  return body;
}
