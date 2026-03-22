import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function MyCoursesScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <Text style={styles.subtitle}>Your enrolled courses will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  title: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b" },
});
