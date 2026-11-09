import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme";

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  accessibilityLabel,
  multiline = false
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel || label}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        returnKeyType="next"
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multiline]}
        textContentType={textContentType}
        value={value}
      />
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading = false, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (disabled || loading) && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.primaryText}>{title}</Text>}
    </Pressable>
  );
}

export function TextLink({ title, onPress, disabled = false }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={styles.linkButton}>
      <Text style={[styles.linkText, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

export function FormMessage({ message, success = false }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={styles.messageWrap}>
      <Text style={[styles.message, success && styles.success]}>{message}</Text>
    </View>
  );
}

export function DividerNote({ children }) {
  return <Text style={styles.note}>{children}</Text>;
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { color: theme.colors.ink, fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    color: theme.colors.ink,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: 16
  },
  multiline: { minHeight: 92, paddingTop: 15, textAlignVertical: "top" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.button,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 4,
    paddingHorizontal: 20
  },
  primaryText: { color: theme.colors.surface, fontSize: 14, fontWeight: "700", letterSpacing: 0.4 },
  pressed: { backgroundColor: theme.colors.accentDark, opacity: 0.92 },
  disabled: { opacity: 0.65 },
  linkButton: { alignSelf: "center", paddingHorizontal: 10, paddingVertical: 12 },
  linkText: { color: theme.colors.accent, fontSize: 14, fontWeight: "600" },
  disabledText: { opacity: 0.55 },
  messageWrap: { backgroundColor: "#F7EAE7", borderRadius: 12, marginBottom: 16, padding: 12 },
  message: { color: theme.colors.error, fontSize: 13, lineHeight: 19 },
  success: { color: theme.colors.success },
  note: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 16 }
});
