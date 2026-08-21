/** Generic hook: a PromQL metric's series over a selectable time range. */

import { useQuery } from '@tanstack/react-query';

import { promQueryRange } from '@/api';

import type { HistoryRangeOption } from '../prometheus.constants';

export interface HistoryPoint {
  timestamp: number;
  value: number;
}

async function fetchHistory(query: string, minutes: number, stepSeconds: number): Promise<HistoryPoint[]> {
  const end = new Date();
  const start = new Date(end.getTime() - minutes * 60 * 1000);

  const response = await promQueryRange(query, start, end, stepSeconds);
  const values = response.data?.result[0]?.values ?? [];

  return values.map(([timestamp, value]) => ({ timestamp, value: Number(value) }));
}

export function useMetricHistory(key: string, query: string, range: HistoryRangeOption) {
  return useQuery({
    queryKey: ['prometheus', 'history', key, range.value],
    queryFn: () => fetchHistory(query, range.minutes, range.stepSeconds),
    refetchInterval: range.refetchIntervalMs,
  });
}
