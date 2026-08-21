import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ConfigTextFieldProps = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'secureTextEntry' | 'keyboardType'
> & {
  label: string;
  error?: string;
};

/** "Label + input" row used both in the server/Portainer form and in the add-ping-site form. */
export function ConfigTextField({ label, error, ...inputProps }: ConfigTextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.inputWrapper}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          {...inputProps}
        />
      </ThemedView>
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  inputWrapper: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
    padding: 0,
  },
  error: {
    color: '#FF3B30',
  },
});
