import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function MyCoursesScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const enrollments = useQuery(api.enrollments.listMyEnrollments);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || enrollments === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0F766E" />
      </View>
    );
  }

  if (enrollments.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No courses yet</Text>
        <Text style={styles.emptySubtitle}>Enroll in a course to see it here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Courses</Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/course/${item.courseId}`)}
          >
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.courseId}
            </Text>
            <Text style={styles.cardSub}>Tap to continue learning →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  heading: { fontSize: 20, fontWeight: "700", color: "#0f172a", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#0f172a", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#0F766E" },
});
