/**
 * Card with the "Liquid Glass" effect on iOS 26+ (expo-glass-effect).
 * On Android/web, `GlassView` automatically falls back to a plain `View`,
 * so we give it a themed background there so it doesn't render transparent.
 */

import { GlassView } from 'expo-glass-effect';
import { Platform, StyleSheet, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function GlassCard({ style, ...rest }: ViewProps) {
  const theme = useTheme();

  return (
    <GlassView
      glassEffectStyle="regular"
      style={[styles.card, Platform.OS !== 'ios' && { backgroundColor: theme.backgroundElement }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    overflow: 'hidden',
  },
});
