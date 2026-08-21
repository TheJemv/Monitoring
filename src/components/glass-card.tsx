/**
 * Tarjeta con efecto "Liquid Glass" en iOS 26+ (expo-glass-effect).
 * En Android/web, `GlassView` cae automáticamente a un `View` normal,
 * así que ahí le damos un fondo temático para que no quede transparente.
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
