import { PromQueries } from '@/api';

import type { HistoryRangeOption } from '../prometheus.constants';
import { useMetricHistory } from './use-metric-history';

/** Temperatura de CPU en el rango elegido, en °C. */
export function useTemperatureHistory(range: HistoryRangeOption) {
  return useMetricHistory('temperature', PromQueries.cpuTemperatureCelsius, range);
}
