import { View, Text, StyleSheet } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Courses</Text>
      <Text style={styles.subtitle}>Course marketplace coming in Phase 2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  title: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b" },
});
