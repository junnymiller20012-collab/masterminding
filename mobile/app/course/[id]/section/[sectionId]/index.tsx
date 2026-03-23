import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

export default function SectionPlayerScreen() {
  const { id, sectionId } = useLocalSearchParams<{ id: string; sectionId: string }>();
  const router = useRouter();
  const [marking, setMarking] = useState(false);

  const sections = useQuery(api.sections.listByCourse, { courseId: id as Id<"courses"> });
  const progress = useQuery(api.progress.getProgressByCourse, { courseId: id as Id<"courses"> });
  const markComplete = useMutation(api.progress.markSectionComplete);

  if (sections === undefined || progress === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0F766E" />
      </View>
    );
  }

  const section = sections.find((s) => s._id === sectionId);
  const lesson = section?.lessons[0];
  const completed = progress?.completedLessons ?? [];
  const isDone = completed.includes(sectionId);
  const currentIndex = sections.findIndex((s) => s._id === sectionId);
  const nextSection = sections[currentIndex + 1];

  async function handleMarkComplete() {
    if (isDone || marking) return;
    setMarking(true);
    try {
      await markComplete({
        courseId: id as Id<"courses">,
        sectionId: sectionId as Id<"sections">,
      });
      if (nextSection) {
        router.replace(`/course/${id}/section/${nextSection._id}`);
      } else {
        router.back();
      }
    } finally {
      setMarking(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{section?.title}</Text>

      {lesson?.videoUrl && (
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>📹 Video content</Text>
          <Text style={styles.videoUrl} numberOfLines={1}>{lesson.videoUrl}</Text>
        </View>
      )}

      {lesson?.description && (
        <Text style={styles.body}>{lesson.description}</Text>
      )}

      <TouchableOpacity
        style={[styles.btn, isDone && styles.btnDone, marking && styles.btnDisabled]}
        onPress={handleMarkComplete}
        disabled={isDone || marking}
      >
        <Text style={styles.btnText}>
          {isDone ? "✓ Completed" : marking ? "Saving..." : "Mark Complete"}
        </Text>
      </TouchableOpacity>

      {nextSection && (
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push(`/course/${id}/section/${nextSection._id}`)}
        >
          <Text style={styles.nextBtnText}>Next: {nextSection.title} →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  videoPlaceholder: { backgroundColor: "#1e293b", borderRadius: 12, padding: 24, alignItems: "center" },
  videoText: { color: "#f1f5f9", fontSize: 16, marginBottom: 6 },
  videoUrl: { color: "#94a3b8", fontSize: 12 },
  body: { fontSize: 15, color: "#334155", lineHeight: 24 },
  btn: { backgroundColor: "#0F766E", borderRadius: 10, padding: 14, alignItems: "center" },
  btnDone: { backgroundColor: "#059669" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  nextBtn: { padding: 12, alignItems: "center" },
  nextBtnText: { color: "#0F766E", fontSize: 14, fontWeight: "500" },
});
