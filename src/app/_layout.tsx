import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { queryClient } from '@/lib/query-client';
import { hydrateAppConfig, isAppConfigHydrated } from '@/lib/app-config';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Los overrides guardados en Configuration (host, URLs, sitios de ping)
  // viven en AsyncStorage. Se leen una sola vez aquí, antes de montar las
  // tabs, para que ninguna pantalla dispare su primer fetch con los
  // defaults del .env y luego "salte" a la URL guardada.
  const [configReady, setConfigReady] = useState(isAppConfigHydrated());
  useEffect(() => {
    if (configReady) return;
    hydrateAppConfig().then(() => setConfigReady(true));
  }, [configReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        {configReady && <AppTabs />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
