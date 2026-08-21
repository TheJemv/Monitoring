/** Server's physical RAM, in GiB — adjust this if you change hardware. */
export const MEMORY_TOTAL_GIB = 32;

/**
 * Options for the history range selector. `stepSeconds` grows with the
 * range so we don't ask Prometheus for thousands of points, and
 * `refetchIntervalMs` slows down the refetch rate the longer the range is
 * (no point re-fetching a week of data every 5s).
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
    label: '1 week',
    value: '1w',
    minutes: 7 * 24 * 60,
    stepSeconds: 60 * 60,
    refetchIntervalMs: 10 * 60_000,
  },
];

export const DEFAULT_HISTORY_RANGE_OPTION = HISTORY_RANGE_OPTIONS[0];
