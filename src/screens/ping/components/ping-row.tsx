import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { PingResult } from '@/api';

const ONLINE_COLOR = '#34C759';
const OFFLINE_COLOR = '#FF3B30';
const ERROR_STATUS_COLOR = '#FF9500';

export function PingRow({ label, url, online, statusCode, latencyMs }: PingResult) {
  const color = !online ? OFFLINE_COLOR : statusCode != null && statusCode >= 400 ? ERROR_STATUS_COLOR : ONLINE_COLOR;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.nameGroup}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText type="smallBold">{label}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {online ? `${latencyMs ?? 0} ms` : 'Sin respuesta'}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <ThemedText type="code" themeColor="textSecondary" style={styles.url} numberOfLines={1}>
          {url}
        </ThemedText>
        {online && statusCode != null && (
          <ThemedText type="small" themeColor="textSecondary">
            HTTP {statusCode}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.half,
    paddingVertical: Spacing.two,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  url: {
    fontSize: 11,
    flex: 1,
    marginRight: Spacing.two,
  },
});
