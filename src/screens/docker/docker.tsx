import { useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isPortainerConfigured } from '@/api';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_REFRESH_OPTION, REFRESH_OPTIONS } from '@/constants/refresh-options';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ProjectCard } from './components';
import styles from './docker.styles';
import { useDockerContainers } from './hooks';

export default function Docker() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [refreshOptionValue, setRefreshOptionValue] = useState(DEFAULT_REFRESH_OPTION.value);
  const refreshOption =
    REFRESH_OPTIONS.find((option) => option.value === refreshOptionValue) ?? DEFAULT_REFRESH_OPTION;

  const configured = isPortainerConfigured();
  const projects = useDockerContainers(refreshOption.ms);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await projects.refetch();
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

  if (!configured) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={styles.centerText}>
          Set up Portainer
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Add Portainer to the docker-compose on your server, generate an access token (your user → Access tokens),
          and set the URL and token in the Configuration tab.
        </ThemedText>
      </ThemedView>
    );
  }

  if (projects.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Connecting to Portainer…
        </ThemedText>
      </ThemedView>
    );
  }

  if (projects.isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={styles.centerText}>
          Could not connect
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {projects.error instanceof Error ? projects.error.message : 'Unknown error'}
        </ThemedText>
        <Pressable onPress={() => projects.refetch()} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.retryButton}>
            <ThemedText type="link">Retry</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  const data = projects.data ?? [];
  const totalContainers = data.reduce((sum, project) => sum + project.totalCount, 0);
  const totalRunning = data.reduce((sum, project) => sum + project.runningCount, 0);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: -insets.top } : undefined}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Docker</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {totalRunning}/{totalContainers} containers running · {data.length} stacks
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
          {data.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No containers found.
            </ThemedText>
          ) : (
            data.map((project) => <ProjectCard key={project.name} project={project} />)
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}
