import { useSyncExternalStore } from 'react';

import { getThemePreference, subscribeThemePreference, type ThemePreference } from '@/lib/theme-preference';

/** Current theme override (System/Light/Dark). Re-renders when Configuration changes it. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeThemePreference, getThemePreference, getThemePreference);
}
