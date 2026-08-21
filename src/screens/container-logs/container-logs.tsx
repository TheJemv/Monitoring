import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import styles from './container-logs.styles';
import { useContainerLogs } from './hooks';

/** Qué tan cerca del final (en px) cuenta como "está viendo lo último". */
const STICKY_BOTTOM_THRESHOLD = 60;

export default function ContainerLogs() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const logs = useContainerLogs(id);

  // El log arranca mostrando lo más reciente (abajo), como una terminal.
  // Si el usuario se sube a leer historial, dejamos de "perseguir" el final
  // en cada refetch para no arrancarle la lectura de las manos.
  const scrollRef = useRef<ScrollView>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    isNearBottomRef.current = distanceFromBottom < STICKY_BOTTOM_THRESHOLD;
  };

  const handleContentSizeChange = () => {
    if (isNearBottomRef.current) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  };

  // Mismo patrón que Prometheus/Docker: el spinner nativo solo aparece con
  // pull-to-refresh manual, no con el refetch automático de fondo.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await logs.refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const logText = logs.data?.map((line) => line.text).join('\n') ?? '';

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      scrollEventThrottle={100}
      refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          {name ?? id} · últimas 300 líneas
        </ThemedText>

        {logs.isLoading && (
          <ThemedText type="small" themeColor="textSecondary">
            Cargando logs…
          </ThemedText>
        )}

        {logs.isError && (
          <ThemedText type="small" themeColor="textSecondary">
            {logs.error instanceof Error ? logs.error.message : 'No se pudieron cargar los logs'}
          </ThemedText>
        )}

        {!logs.isLoading && !logs.isError && (
          <ThemedText type="code" themeColor="textSecondary" selectable style={styles.logText}>
            {logText || 'Sin logs todavía.'}
          </ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}
