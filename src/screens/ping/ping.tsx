import { useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_REFRESH_OPTION, REFRESH_OPTIONS } from '@/constants/refresh-options';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PingRow } from './components';
import { usePingTargets } from './hooks';
import styles from './ping.styles';

export default function Ping() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [refreshOptionValue, setRefreshOptionValue] = useState(DEFAULT_REFRESH_OPTION.value);
  const refreshOption =
    REFRESH_OPTIONS.find((option) => option.value === refreshOptionValue) ?? DEFAULT_REFRESH_OPTION;

  const targets = usePingTargets(refreshOption.ms);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await targets.refetch();
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

  if (targets.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Pinging sites…
        </ThemedText>
      </ThemedView>
    );
  }

  if (targets.isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={styles.centerText}>
          Could not check anything
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {targets.error instanceof Error ? targets.error.message : 'Unknown error'}
        </ThemedText>
        <Pressable onPress={() => targets.refetch()} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.retryButton}>
            <ThemedText type="link">Retry</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  const data = targets.data ?? [];
  const onlineCount = data.filter((result) => result.online).length;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: -insets.top } : undefined}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Ping</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {onlineCount}/{data.length} online
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <ThemedText type="small" themeColor="textSecondary">
              Refresh every
            </ThemedText>
            <SegmentedControl options={REFRESH_OPTIONS} value={refreshOptionValue} onChange={setRefreshOptionValue} />
          </View>
        </View>

        <View style={styles.list}>
          <GlassCard>
            {data.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No sites configured — add some in the Configuration tab.
              </ThemedText>
            ) : (
              data.map((result) => <PingRow key={result.url} {...result} />)
            )}
          </GlassCard>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
