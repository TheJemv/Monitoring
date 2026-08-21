/** Cliente de bajo nivel para la HTTP API de Prometheus (`/api/v1/query*`). */

import { getAppConfig } from '@/lib/app-config';

import { ApiError, apiFetch, joinUrl } from '../http';
import type { PrometheusQueryResponse, PrometheusRangeQueryResponse, PrometheusResponse } from './types';

function toUnixSeconds(date: Date): string {
  return (date.getTime() / 1000).toString();
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(joinUrl(getAppConfig().prometheusUrl, path));
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function assertSuccess<T>(response: PrometheusResponse<T>): PrometheusResponse<T> {
  if (response.status !== 'success') {
    throw new ApiError(response.error ?? 'Prometheus devolvió un error desconocido');
  }
  return response;
}

/** Ejecuta una consulta PromQL instantánea (`/api/v1/query`). */
export async function promQuery(query: string, time?: Date): Promise<PrometheusQueryResponse> {
  const params: Record<string, string> = { query };
  if (time) params.time = toUnixSeconds(time);

  const response = await apiFetch<PrometheusQueryResponse>(buildUrl('/api/v1/query', params));
  return assertSuccess(response);
}

/** Ejecuta una consulta PromQL sobre un rango de tiempo, para graficar series (`/api/v1/query_range`). */
export async function promQueryRange(
  query: string,
  start: Date,
  end: Date,
  stepSeconds: number
): Promise<PrometheusRangeQueryResponse> {
  const params = {
    query,
    start: toUnixSeconds(start),
    end: toUnixSeconds(end),
    step: stepSeconds.toString(),
  };

  const response = await apiFetch<PrometheusRangeQueryResponse>(buildUrl('/api/v1/query_range', params));
  return assertSuccess(response);
}
