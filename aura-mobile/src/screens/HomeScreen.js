import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { theme } from "../constants/theme";

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } catch (logoutError) {
      Alert.alert("Signed out on this device", `The server could not confirm token revocation. Sign out may not take effect on other devices.\n\n${logoutError.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.brand}>A U R A</Text>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>YOUR SPACE</Text>
          <Text style={styles.title}>Welcome, {user?.name?.split(" ")[0] || "beautiful"}.</Text>
          <Text style={styles.subtitle}>Your personal style and beauty companion is ready when you are.</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TODAY’S NOTE</Text>
            <Text style={styles.cardText}>The best style is the one that feels like you.</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ busy: loading }} disabled={loading} onPress={handleLogout} style={styles.logout}>
          <Text style={styles.logoutText}>{loading ? "Signing out…" : "Sign out"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "space-between", padding: 26 },
  brand: { color: theme.colors.ink, fontSize: 13, fontWeight: "700", letterSpacing: 5 },
  content: { marginVertical: 40 },
  eyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
  title: { color: theme.colors.ink, fontSize: 36, fontWeight: "500", letterSpacing: -1.2 },
  subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12 },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.card, borderWidth: 1, marginTop: 32, padding: 24 },
  cardLabel: { color: theme.colors.accent, fontSize: 9, fontWeight: "700", letterSpacing: 1.7 },
  cardText: { color: theme.colors.ink, fontSize: 21, lineHeight: 30, marginTop: 14 },
  logout: { alignItems: "center", borderColor: theme.colors.border, borderRadius: theme.radius.button, borderWidth: 1, justifyContent: "center", minHeight: 52 },
  logoutText: { color: theme.colors.ink, fontSize: 14, fontWeight: "600" },
});
