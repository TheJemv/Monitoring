import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { GitHubIcon } from '@/components/github-icon';
import { GlassCard } from '@/components/glass-card';
import { SegmentedControl, type SegmentedControlOption } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/hooks/use-theme-preference';
import { setThemePreference, type ThemePreference } from '@/lib/theme-preference';

import { ConfigTextField, PingTargetsEditor } from './components';
import styles from './config.styles';
import { useConfigForm } from './hooks';

const REPO_URL = 'https://github.com/TheJemv/Monitoring';

const THEME_OPTIONS: SegmentedControlOption<ThemePreference>[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function Config() {
  const theme = useTheme();
  const themePreference = useThemePreference();
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
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: -insets.top } : undefined}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Configuration</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Change the server and the sites to monitor without rebuilding the app.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Server</ThemedText>
          </View>
          <GlassCard style={styles.card}>
            <ConfigTextField
              label="Server host"
              placeholder="e.g. 192.168.0.69 or mydomain.com"
              value={draft.serverHost}
              onChangeText={setField('serverHost')}
              error={errors.serverHost}
            />
            <ConfigTextField
              label="Prometheus URL"
              placeholder="e.g. https://prometheus.mydomain.com"
              value={draft.prometheusUrl}
              onChangeText={setField('prometheusUrl')}
              keyboardType="url"
              error={errors.prometheusUrl}
            />
            <ConfigTextField
              label="node-exporter URL"
              placeholder="e.g. https://node-exporter.mydomain.com"
              value={draft.nodeExporterUrl}
              onChangeText={setField('nodeExporterUrl')}
              keyboardType="url"
              error={errors.nodeExporterUrl}
            />
            <ConfigTextField
              label="cAdvisor URL"
              placeholder="e.g. https://cadvisor.mydomain.com"
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
              Optional
            </ThemedText>
          </View>
          <GlassCard style={styles.card}>
            <ConfigTextField
              label="Portainer URL"
              placeholder="e.g. https://portainer.mydomain.com"
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
                <ThemedText type="link">{justSaved ? 'Saved ✓' : 'Save'}</ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable onPress={reset} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.resetButton}>
                <ThemedText type="link" themeColor="textSecondary">
                  Reset
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Sites to ping</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {pingTargets.length}
            </ThemedText>
          </View>
          <GlassCard>
            <PingTargetsEditor targets={pingTargets} onAdd={addPingTarget} onRemove={removePingTarget} />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Appearance</ThemedText>
          </View>
          <GlassCard style={styles.card}>
            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                Theme
              </ThemedText>
              <SegmentedControl options={THEME_OPTIONS} value={themePreference} onChange={setThemePreference} />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <ExternalLink href={REPO_URL} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <View style={styles.githubButton}>
                <GitHubIcon size={18} color="#ffffff" />
                <ThemedText type="link" style={styles.githubButtonText}>
                  Server configuration guide
                </ThemedText>
              </View>
            </Pressable>
          </ExternalLink>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
