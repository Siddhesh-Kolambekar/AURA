import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../constants/theme";

export function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.markText}>A</Text></View>
          <Text style={styles.brandName}>AURA</Text>
        </View>
        <View style={styles.art}>
          <View style={styles.outerRing} />
          <View style={styles.innerRing} />
          <View style={styles.centerMark}><Text style={styles.centerText}>a</Text></View>
          <View style={styles.caption}><Text style={styles.captionText}>MADE FOR YOUR EVERYDAY</Text></View>
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>STYLE, WITH INTENTION</Text>
          <Text style={styles.title}>A little more{`\n`}you, every day.</Text>
          <Text style={styles.subtitle}>Discover the looks, rituals and little details that feel like you.</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Register")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Create your account</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>I already have an account <Text style={styles.arrow}>↗</Text></Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>YOUR PERSONAL STYLE COMPANION</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "space-between", paddingHorizontal: 26, paddingVertical: 18 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  brandMark: { alignItems: "center", backgroundColor: theme.colors.accent, borderRadius: 16, height: 38, justifyContent: "center", width: 38 },
  markText: { color: theme.colors.surface, fontSize: 22, fontStyle: "italic", fontWeight: "600" },
  brandName: { color: theme.colors.ink, fontSize: 14, fontWeight: "700", letterSpacing: 4 },
  art: { alignItems: "center", alignSelf: "center", height: 245, justifyContent: "center", width: 245 },
  outerRing: { borderColor: "#DCCFC1", borderRadius: 150, borderWidth: 1, height: 220, position: "absolute", transform: [{ rotate: "-26deg" }], width: 180 },
  innerRing: { borderColor: "#B99078", borderRadius: 120, borderWidth: 1, height: 178, position: "absolute", transform: [{ rotate: "32deg" }], width: 150 },
  centerMark: { alignItems: "center", backgroundColor: theme.colors.soft, borderRadius: 55, height: 110, justifyContent: "center", width: 110 },
  centerText: { color: theme.colors.accent, fontSize: 72, fontStyle: "italic", fontWeight: "300", marginTop: -8 },
  caption: { backgroundColor: theme.colors.background, bottom: 8, paddingHorizontal: 10, position: "absolute", right: 0 },
  captionText: { color: theme.colors.muted, fontSize: 8, fontWeight: "700", letterSpacing: 1.8 },
  copy: { marginBottom: 8 },
  eyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
  title: { color: theme.colors.ink, fontSize: 42, fontWeight: "500", letterSpacing: -1.6, lineHeight: 47 },
  subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 330 },
  actions: { gap: 8, marginTop: 10 },
  primaryButton: { alignItems: "center", backgroundColor: theme.colors.accent, borderRadius: 17, justifyContent: "center", minHeight: 56 },
  primaryText: { color: theme.colors.surface, fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  pressed: { backgroundColor: theme.colors.accentDark, opacity: 0.92 },
  secondaryButton: { alignItems: "center", justifyContent: "center", minHeight: 50 },
  secondaryText: { color: theme.colors.ink, fontSize: 13, fontWeight: "600" },
  arrow: { color: theme.colors.accent, fontSize: 17 },
  footer: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.5, marginTop: 12, textAlign: "center" }
});
