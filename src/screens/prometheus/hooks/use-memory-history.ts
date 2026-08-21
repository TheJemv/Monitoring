import { PromQueries } from '@/api';

import type { HistoryRangeOption } from '../prometheus.constants';
import { useMetricHistory } from './use-metric-history';

/** RAM usada (en GiB) en el rango elegido. */
export function useMemoryHistory(range: HistoryRangeOption) {
  return useMetricHistory('memory', PromQueries.memoryUsedGiB, range);
}
