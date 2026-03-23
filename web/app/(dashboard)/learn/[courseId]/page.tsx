"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { CoursePlayer } from "@/components/features/courses/CoursePlayer";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default function LearnPage({ params }: Props) {
  const { courseId } = use(params);
  const router = useRouter();

  const course = useQuery(api.courses.getById, { courseId: courseId as Id<"courses"> });
  const sections = useQuery(api.sections.listByCourse, { courseId: courseId as Id<"courses"> });
  const enrollment = useQuery(api.enrollments.checkEnrollment, {
    courseId: courseId as Id<"courses">,
  });
  const progress = useQuery(api.progress.getProgressByCourse, {
    courseId: courseId as Id<"courses">,
  });

  const isLoading =
    course === undefined ||
    sections === undefined ||
    enrollment === undefined ||
    progress === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!enrollment) {
    router.replace(`/dashboard`);
    return null;
  }

  if (!course || !sections) {
    return <div className="p-8 text-slate-500">Course not found.</div>;
  }

  const completedSectionIds = progress?.completedLessons ?? [];

  return (
    <CoursePlayer
      courseId={courseId as Id<"courses">}
      courseTitle={course.title}
      sections={sections as any}
      completedSectionIds={completedSectionIds}
    />
  );
}
