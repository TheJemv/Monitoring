import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ServiceHealth } from '@/api';

const ONLINE_COLOR = '#34C759';
const OFFLINE_COLOR = '#FF3B30';

export function ServiceStatusRow({ name, online, latencyMs }: ServiceHealth) {
  const color = online ? ONLINE_COLOR : OFFLINE_COLOR;

  return (
    <View style={styles.row}>
      <SymbolView
        name={{
          ios: online ? 'checkmark.circle.fill' : 'xmark.circle.fill',
          android: online ? 'cloud_done' : 'cloud_off',
          web: online ? 'cloud_done' : 'cloud_off',
        }}
        size={18}
        tintColor={color}
      />
      <ThemedText type="small" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {online ? `${latencyMs ?? 0} ms` : 'Offline'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  name: {
    flex: 1,
  },
});
