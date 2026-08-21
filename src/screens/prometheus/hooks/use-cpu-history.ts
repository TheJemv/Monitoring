import { PromQueries } from '@/api';

import type { HistoryRangeOption } from '../prometheus.constants';
import { useMetricHistory } from './use-metric-history';

/** % de uso de CPU en el rango elegido. */
export function useCpuHistory(range: HistoryRangeOption) {
  return useMetricHistory('cpu', PromQueries.cpuUsagePercent, range);
}
