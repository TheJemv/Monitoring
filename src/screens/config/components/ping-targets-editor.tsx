import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { PingTarget } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import { ConfigTextField } from './config-text-field';

interface PingTargetsEditorProps {
  targets: PingTarget[];
  onAdd: (target: PingTarget) => void;
  onRemove: (url: string) => void;
}

/** Prepends `https://` if the user only typed a domain, and validates the result is a real URL. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

export function PingTargetsEditor({ targets, onAdd, onRemove }: PingTargetsEditorProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string>();

  const handleAdd = () => {
    const normalized = normalizeUrl(url);
    if (!label.trim() || !normalized) {
      setError('Enter a name and a valid URL or domain.');
      return;
    }
    if (targets.some((target) => target.url === normalized)) {
      setError('That site is already in the list.');
      return;
    }
    onAdd({ label: label.trim(), url: normalized });
    setLabel('');
    setUrl('');
    setError(undefined);
  };

  return (
    <View style={styles.container}>
      {targets.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          No sites configured yet.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {targets.map((target) => (
            <View key={target.url} style={styles.row}>
              <View style={styles.rowText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {target.label}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
                  {target.url}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => onRemove(target.url)}
                hitSlop={8}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundSelected" style={styles.removeButton}>
                  <ThemedText type="small">Remove</ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.form}>
        <ConfigTextField label="Name" placeholder="e.g. My site" value={label} onChangeText={setLabel} />
        <ConfigTextField
          label="URL"
          placeholder="e.g. mydomain.com"
          value={url}
          onChangeText={setUrl}
          keyboardType="url"
          error={error}
        />
        <Pressable onPress={handleAdd} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.addButton}>
            <ThemedText type="link">Add site</ThemedText>
          </ThemedView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  removeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  form: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
