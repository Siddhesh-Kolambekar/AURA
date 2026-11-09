import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../constants/theme";

export function AuthLayout({ children, eyebrow = "YOUR PERSONAL STYLE COMPANION", title, subtitle }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>
            <Text style={styles.brandName}>AURA</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.formCard}>{children}</View>
          <Text style={styles.footer}>A little more you, every day.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 44 },
  brandMark: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  brandMarkText: { color: theme.colors.surface, fontSize: 22, fontStyle: "italic", fontWeight: "600" },
  brandName: { color: theme.colors.ink, fontSize: 14, fontWeight: "700", letterSpacing: 4 },
  heading: { marginBottom: 26 },
  eyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
  title: { color: theme.colors.ink, fontSize: 36, fontWeight: "500", letterSpacing: -1.2, lineHeight: 42 },
  subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 340 },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    padding: 22
  },
  footer: { color: theme.colors.muted, fontSize: 12, letterSpacing: 0.4, marginTop: 24, textAlign: "center" }
});
