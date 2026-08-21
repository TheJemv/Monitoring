import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { hydrateAppConfig, isAppConfigHydrated } from '@/lib/app-config';
import { queryClient } from '@/lib/query-client';
import { hydrateThemePreference, isThemePreferenceHydrated } from '@/lib/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // The overrides saved in Configuration (host, URLs, ping sites) and the
  // theme preference (System/Light/Dark) both live in AsyncStorage. They're
  // read once here, before mounting the tabs, so no screen fires its first
  // fetch or paints the wrong theme before "jumping" to the saved value.
  const [appReady, setAppReady] = useState(isAppConfigHydrated() && isThemePreferenceHydrated());
  useEffect(() => {
    if (appReady) return;
    Promise.all([hydrateAppConfig(), hydrateThemePreference()]).then(() => setAppReady(true));
  }, [appReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        {appReady && <AppTabs />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
