/** Tipos de la HTTP API de Prometheus. https://prometheus.io/docs/prometheus/latest/querying/api/ */

export type PrometheusResultType = 'vector' | 'matrix' | 'scalar' | 'string';

export interface PrometheusVectorResult {
  metric: Record<string, string>;
  /** [timestamp en segundos, valor como string] */
  value: [number, string];
}

export interface PrometheusMatrixResult {
  metric: Record<string, string>;
  /** Serie de [timestamp en segundos, valor como string] */
  values: [number, string][];
}

export interface PrometheusResponse<T> {
  status: 'success' | 'error';
  data?: {
    resultType: PrometheusResultType;
    result: T[];
  };
  errorType?: string;
  error?: string;
}

export type PrometheusQueryResponse = PrometheusResponse<PrometheusVectorResult>;
export type PrometheusRangeQueryResponse = PrometheusResponse<PrometheusMatrixResult>;
