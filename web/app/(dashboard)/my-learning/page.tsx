"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyLearningPage() {
  const enrollments = useQuery(api.enrollments.listMyEnrollments);
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.myLearning}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.myLearningDesc}</p>
      </div>

      {enrollments === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{t.noEnrollments}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{t.noEnrollmentsDesc}</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors"
          >
            <Compass className="w-4 h-4" />
            {t.navExplore}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enrollment) => {
            const progress = enrollment.totalSections > 0
              ? Math.round((enrollment.completedCount / enrollment.totalSections) * 100)
              : 0;

            return (
              <div
                key={enrollment._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
              >
                {/* Cover image */}
                <div className="h-36 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {enrollment.coverImageUrl ? (
                    <img
                      src={enrollment.coverImageUrl}
                      alt={enrollment.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  {/* Progress badge */}
                  {progress === 100 && (
                    <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Done
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{enrollment.mentorName}</p>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug mb-3 flex-1">
                    {enrollment.courseTitle}
                  </h3>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                      <span>{enrollment.completedCount}/{enrollment.totalSections} {t.completed}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/${enrollment.courseId}`}
                    className="w-full text-center bg-[#0F766E] hover:bg-[#0D6D65] text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    {progress === 0 ? t.startLearning : t.continueLearning} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
