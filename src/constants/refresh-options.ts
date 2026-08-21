/** Opciones del selector "actualizar cada", compartidas por las pantallas que hacen polling. */
export interface RefreshOption {
  label: string;
  value: string;
  ms: number;
}

export const REFRESH_OPTIONS: RefreshOption[] = [
  { label: '5s', value: '5s', ms: 5000 },
  { label: '10s', value: '10s', ms: 10000 },
  { label: '15s', value: '15s', ms: 15000 },
  { label: '30s', value: '30s', ms: 30000 },
  { label: '60s', value: '60s', ms: 60000 },
];

export const DEFAULT_REFRESH_OPTION = REFRESH_OPTIONS[0];
