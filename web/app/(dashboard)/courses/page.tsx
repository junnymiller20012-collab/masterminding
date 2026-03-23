"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CourseCard } from "@/components/features/courses/CourseCard";

export default function CoursesPage() {
  const courses = useQuery(api.courses.listByMentor);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <Link
          href="/courses/new"
          className="flex items-center gap-2 bg-[#0F766E] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      {courses === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">No courses yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Create your first course and start selling.</p>
          <Link
            href="/courses/new"
            className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              id={course._id}
              title={course.title}
              status={course.status}
              enrollmentCount={course.enrollmentCount}
              totalRevenueCents={course.totalRevenueCents}
              priceCents={course.priceCents}
              coverImageUrl={course.coverImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
