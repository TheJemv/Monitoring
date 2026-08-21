/**
 * User-selected theme override (System / Light / Dark), persisted across app
 * restarts.
 *
 * "System" defers to the OS appearance. Light/Dark force it by calling
 * `Appearance.setColorScheme`, React Native's own override API — every
 * `useColorScheme()` call in the app (the router's `ThemeProvider`, the tab
 * bar colors, `useTheme()`) already reads from `Appearance`, so forcing it
 * here is enough to theme the whole app with no extra wiring per screen.
 *
 * Same store-outside-React shape as `@/lib/app-config`: screens read it with
 * `useThemePreference()` (`@/hooks/use-theme-preference`).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const STORAGE_KEY = 'monitoring-app/theme-preference/v1';

export type ThemePreference = 'system' | 'light' | 'dark';

let preference: ThemePreference = 'system';
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function applyToAppearance(next: ThemePreference) {
  // 'unspecified' is RN's reset-to-system sentinel: Appearance immediately
  // re-reads the OS scheme after this call, so `useColorScheme()` never
  // actually reports 'unspecified' back — it resolves to the real value.
  Appearance.setColorScheme(next === 'system' ? 'unspecified' : next);
}

/** For `useSyncExternalStore`: registers a listener and returns how to unsubscribe. */
export function subscribeThemePreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getThemePreference(): ThemePreference {
  return preference;
}

export function isThemePreferenceHydrated(): boolean {
  return hydrated;
}

/** Reads the saved preference from AsyncStorage and applies it. Call once on app startup. */
export async function hydrateThemePreference(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      preference = saved;
    }
  } catch (error) {
    console.warn('Could not read the saved theme preference, defaulting to "system"', error);
  } finally {
    applyToAppearance(preference);
    hydrated = true;
    emit();
  }
}

export function setThemePreference(next: ThemePreference) {
  preference = next;
  applyToAppearance(next);
  emit();
  AsyncStorage.setItem(STORAGE_KEY, next).catch((error) => {
    console.warn('Could not save the theme preference', error);
  });
}
