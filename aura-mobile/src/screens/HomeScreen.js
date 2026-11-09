import { StyleSheet, Text, View } from "react-native";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AURA</Text>
      <Text>Your personal style and beauty companion.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8
  }
});
