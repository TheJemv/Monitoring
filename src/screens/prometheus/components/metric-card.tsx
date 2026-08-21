import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconSet = { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol };

type MetricCardProps = {
  label: string;
  icon: IconSet;
  value: string;
  subtitle?: string;
  /** 0-100. If passed, draws a progress bar below the value. */
  percent?: number | null;
  accentColor?: string;
};

export function MetricCard({ label, icon, value, subtitle, percent, accentColor }: MetricCardProps) {
  const theme = useTheme();
  const accent = accentColor ?? theme.text;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <SymbolView name={icon} size={18} tintColor={theme.textSecondary} weight="medium" />
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.value}>
        {value}
      </ThemedText>

      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}

      {percent != null ? (
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: accent }]}
          />
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
