import { useSyncExternalStore } from 'react';

import { type AppConfig, getAppConfig, subscribeAppConfig } from '@/lib/app-config';

/** Config vigente (overrides guardados + defaults del `.env`). Re-renderiza cuando la pantalla de Configuration guarda cambios. */
export function useAppConfig(): AppConfig {
  return useSyncExternalStore(subscribeAppConfig, getAppConfig, getAppConfig);
}
