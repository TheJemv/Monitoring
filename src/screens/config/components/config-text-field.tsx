import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
        ]}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          {...inputProps}
        />
      </View>
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
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    // Raised "box" look: soft shadow on iOS, elevation on Android.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
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
