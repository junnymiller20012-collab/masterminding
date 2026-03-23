"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { SalesPageEditor } from "@/components/features/courses/SalesPageEditor";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SalesPageRoute({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const course = useQuery(api.courses.getById, { courseId: id as Id<"courses"> });
  const mentor = useQuery(api.mentors.getMe);
  const publishCourse = useMutation(api.courses.publish);

  if (course === undefined || mentor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return <div className="p-8 text-slate-500">Course not found.</div>;

  async function handlePublish() {
    try {
      await publishCourse({ courseId: id as Id<"courses"> });
      router.push(`/courses/${id}/share`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Sales Page</h1>
          <p className="text-slate-500 text-sm mt-1">{course.title}</p>
        </div>
        <button
          onClick={handlePublish}
          className="bg-[#0F766E] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors"
        >
          Publish Course →
        </button>
      </div>

      {!course.salesPageGenerated && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-6">
          Your sales page is being generated — it will appear below in a few seconds. You can also edit the fields manually.
        </div>
      )}

      <SalesPageEditor
        courseId={id as Id<"courses">}
        initialHeadline={course.salesPageHeadline ?? ""}
        initialSubheadline={course.salesPageSubheadline ?? ""}
        initialBody={course.salesPageBody ?? ""}
        courseTitle={course.title}
        outcomes={course.outcomes}
        mentorName={mentor?.name}
        priceCents={course.priceCents}
        mentorSlug={mentor?.slug ?? ""}
        courseSlug={course.slug}
      />
    </div>
  );
}
