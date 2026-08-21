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

/** How close to the bottom (in px) counts as "looking at the latest line". */
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

  // The log starts showing the most recent line (at the bottom), like a
  // terminal. If the user scrolls up to read older lines, we stop
  // "chasing" the bottom on every refetch so we don't yank their reading
  // position away.
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

  // Same pattern as Prometheus/Docker: the native spinner only shows up
  // with manual pull-to-refresh, not with the background auto-refetch.
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
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: -insets.top } : undefined}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      scrollEventThrottle={100}
      refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          {name ?? id} · last 300 lines
        </ThemedText>

        {logs.isLoading && (
          <ThemedText type="small" themeColor="textSecondary">
            Loading logs…
          </ThemedText>
        )}

        {logs.isError && (
          <ThemedText type="small" themeColor="textSecondary">
            {logs.error instanceof Error ? logs.error.message : 'Could not load the logs'}
          </ThemedText>
        )}

        {!logs.isLoading && !logs.isError && (
          <ThemedText type="code" themeColor="textSecondary" selectable style={styles.logText}>
            {logText || 'No logs yet.'}
          </ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}
