/** RAM física del servidor, en GiB — ajusta si cambias de hardware. */
export const MEMORY_TOTAL_GIB = 32;

/**
 * Opciones del selector de rango de historial. `stepSeconds` crece con el
 * rango para no pedirle a Prometheus miles de puntos, y `refetchIntervalMs`
 * baja la frecuencia de refetch mientras más largo es el rango (no tiene
 * sentido re-pedir 1 semana de datos cada 5s).
 */
export interface HistoryRangeOption {
  label: string;
  value: string;
  minutes: number;
  stepSeconds: number;
  refetchIntervalMs: number;
}

export const HISTORY_RANGE_OPTIONS: HistoryRangeOption[] = [
  { label: '30m', value: '30m', minutes: 30, stepSeconds: 60, refetchIntervalMs: 30_000 },
  { label: '6h', value: '6h', minutes: 6 * 60, stepSeconds: 5 * 60, refetchIntervalMs: 60_000 },
  { label: '12h', value: '12h', minutes: 12 * 60, stepSeconds: 10 * 60, refetchIntervalMs: 2 * 60_000 },
  { label: '24h', value: '24h', minutes: 24 * 60, stepSeconds: 15 * 60, refetchIntervalMs: 5 * 60_000 },
  {
    label: '1 semana',
    value: '1w',
    minutes: 7 * 24 * 60,
    stepSeconds: 60 * 60,
    refetchIntervalMs: 10 * 60_000,
  },
];

export const DEFAULT_HISTORY_RANGE_OPTION = HISTORY_RANGE_OPTIONS[0];
