import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GlassCard } from '@/components/glass-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatBytes, formatPercent } from '@/utils/format';
import type { ComposeProject } from '@/api';

import { ContainerRow } from './container-row';

export function ProjectCard({ project }: { project: ComposeProject }) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const totalCpuPercent = project.containers.reduce((sum, container) => sum + (container.cpuPercent ?? 0), 0);
  const totalMemoryBytes = project.containers.reduce(
    (sum, container) => sum + (container.memoryUsedBytes ?? 0),
    0
  );

  return (
    <GlassCard style={styles.card}>
      <Pressable onPress={() => setIsOpen((value) => !value)} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <SymbolView
              name={{ ios: 'shippingbox', android: 'inventory_2', web: 'inventory_2' }}
              size={16}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="smallBold">{project.name}</ThemedText>
          </View>
          <View style={styles.titleGroup}>
            <ThemedText type="small" themeColor="textSecondary">
              {project.runningCount}/{project.totalCount} running
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={12}
              weight="bold"
              tintColor={theme.textSecondary}
              style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
            />
          </View>
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          CPU {formatPercent(totalCpuPercent)} · RAM {formatBytes(totalMemoryBytes)}
        </ThemedText>
      </Pressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.containers}>
          {project.containers.map((container) => (
            <ContainerRow key={container.id} container={container} />
          ))}
        </Animated.View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  containers: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
