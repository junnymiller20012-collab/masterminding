import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function CourseOutlineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = useQuery(api.courses.getById, { courseId: id as Id<"courses"> });
  const sections = useQuery(api.sections.listByCourse, { courseId: id as Id<"courses"> });
  const progress = useQuery(api.progress.getProgressByCourse, { courseId: id as Id<"courses"> });

  if (course === undefined || sections === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0F766E" />
      </View>
    );
  }

  const completed = progress?.completedLessons ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{course?.title}</Text>
      <Text style={styles.progress}>{completed.length} / {sections.length} completed</Text>
      <FlatList
        data={sections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item, index }) => {
          const isDone = completed.includes(item._id);
          return (
            <TouchableOpacity
              style={[styles.sectionCard, isDone && styles.sectionDone]}
              onPress={() => router.push(`/course/${id}/section/${item._id}`)}
            >
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionNum, isDone && styles.sectionNumDone]}>
                  {isDone ? "✓" : index + 1}
                </Text>
                <Text style={styles.sectionTitle} numberOfLines={2}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a", padding: 16, paddingBottom: 4 },
  progress: { fontSize: 13, color: "#64748b", paddingHorizontal: 16, marginBottom: 4 },
  sectionCard: { backgroundColor: "#fff", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionDone: { borderColor: "#0F766E", backgroundColor: "#f0fdf4" },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e2e8f0", textAlign: "center", lineHeight: 28, fontSize: 13, fontWeight: "600", color: "#64748b" },
  sectionNumDone: { backgroundColor: "#0F766E", color: "#fff" },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: "#0f172a" },
});
