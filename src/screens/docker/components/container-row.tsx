import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatBytes, formatPercent } from '@/utils/format';
import type { ContainerState, ContainerSummary } from '@/api';

const STATE_META: Record<ContainerState, { label: string; color: string }> = {
  running: { label: 'Running', color: '#34C759' },
  exited: { label: 'Exited', color: '#FF3B30' },
  dead: { label: 'Dead', color: '#FF3B30' },
  paused: { label: 'Paused', color: '#FF9500' },
  restarting: { label: 'Restarting', color: '#FF9500' },
  created: { label: 'Created', color: '#8E8E93' },
  removing: { label: 'Removing', color: '#8E8E93' },
};

export function ContainerRow({ container }: { container: ContainerSummary }) {
  const meta = STATE_META[container.state] ?? { label: container.state, color: '#8E8E93' };

  const handlePress = () => {
    router.push({ pathname: '/docker/[id]', params: { id: container.id, name: container.service } });
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.nameGroup}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          <ThemedText type="smallBold">{container.service}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {meta.label}
        </ThemedText>
      </View>

      <ThemedText type="code" themeColor="textSecondary" style={styles.image} numberOfLines={1}>
        {container.image}
      </ThemedText>

      <View style={styles.stats}>
        <ThemedText type="small" themeColor="textSecondary">
          CPU {container.cpuPercent != null ? formatPercent(container.cpuPercent) : '—'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          RAM {container.memoryUsedBytes != null ? formatBytes(container.memoryUsedBytes) : '—'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Disk {container.diskBytes != null ? formatBytes(container.diskBytes) : '—'}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.half,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  image: {
    fontSize: 11,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
