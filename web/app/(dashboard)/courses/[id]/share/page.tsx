"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ShareScreen } from "@/components/features/courses/ShareScreen";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SharePage({ params }: Props) {
  const { id } = use(params);
  const course = useQuery(api.courses.getById, { courseId: id as Id<"courses"> });
  const mentor = useQuery(api.mentors.getMe);

  if (course === undefined || mentor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !mentor) return <div className="p-8 text-slate-500">Course not found.</div>;

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${mentor.slug}/${course.slug}`;

  return <ShareScreen courseTitle={course.title} shareUrl={shareUrl} />;
}
