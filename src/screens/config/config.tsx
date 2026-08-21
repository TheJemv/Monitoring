import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ConfigTextField, PingTargetsEditor } from './components';
import styles from './config.styles';
import { useConfigForm } from './hooks';

export default function Config() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const { draft, errors, justSaved, setField, save, reset, pingTargets, addPingTarget, removePingTarget } =
    useConfigForm();

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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Configuration</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Cambia el servidor y los sitios a monitorear sin recompilar la app.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Servidor</ThemedText>
          </View>
          <GlassCard style={styles.card}>
            <ConfigTextField
              label="Host del servidor"
              placeholder="ej. 192.168.0.69 o midominio.com"
              value={draft.serverHost}
              onChangeText={setField('serverHost')}
              error={errors.serverHost}
            />
            <ConfigTextField
              label="URL de Prometheus"
              placeholder="ej. https://prometheus.midominio.com"
              value={draft.prometheusUrl}
              onChangeText={setField('prometheusUrl')}
              keyboardType="url"
              error={errors.prometheusUrl}
            />
            <ConfigTextField
              label="URL de node-exporter"
              placeholder="ej. https://node-exporter.midominio.com"
              value={draft.nodeExporterUrl}
              onChangeText={setField('nodeExporterUrl')}
              keyboardType="url"
              error={errors.nodeExporterUrl}
            />
            <ConfigTextField
              label="URL de cAdvisor"
              placeholder="ej. https://cadvisor.midominio.com"
              value={draft.cadvisorUrl}
              onChangeText={setField('cadvisorUrl')}
              keyboardType="url"
              error={errors.cadvisorUrl}
            />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Portainer</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Opcional
            </ThemedText>
          </View>
          <GlassCard style={styles.card}>
            <ConfigTextField
              label="URL de Portainer"
              placeholder="ej. https://portainer.midominio.com"
              value={draft.portainerUrl}
              onChangeText={setField('portainerUrl')}
              keyboardType="url"
              error={errors.portainerUrl}
            />
            <ConfigTextField
              label="Access token"
              placeholder="Account settings → Access tokens"
              value={draft.portainerApiToken}
              onChangeText={setField('portainerApiToken')}
              secureTextEntry
            />
          </GlassCard>

          <View style={styles.actions}>
            <Pressable onPress={save} style={({ pressed }) => [{ flex: 1 }, pressed && styles.pressed]}>
              <ThemedView type="backgroundSelected" style={styles.saveButton}>
                <ThemedText type="link">{justSaved ? 'Guardado ✓' : 'Guardar'}</ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable onPress={reset} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.resetButton}>
                <ThemedText type="link" themeColor="textSecondary">
                  Restablecer
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Sitios a pingear</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {pingTargets.length}
            </ThemedText>
          </View>
          <GlassCard>
            <PingTargetsEditor targets={pingTargets} onAdd={addPingTarget} onRemove={removePingTarget} />
          </GlassCard>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
