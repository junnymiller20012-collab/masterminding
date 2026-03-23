"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Trophy, Loader2, BookOpen } from "lucide-react";

const milestoneIcons: Record<string, string> = {
  course_published:   "🚀",
  link_shared:        "🔗",
  first_3_students:   "👥",
  first_100_dollars:  "💵",
  first_10_students:  "🎯",
  first_500_dollars:  "💰",
  second_course:      "📚",
  first_1000_dollars: "🏆",
  first_50_students:  "⭐",
  first_100_students: "👑",
};

export default function GrowthPage() {
  const data = useQuery(api.milestones.getMilestones);
  const courses = useQuery(api.courses.listByMentor);
  const markComplete = useMutation(api.milestones.markManualComplete);
  const saveTip = useMutation(api.milestones.saveTip);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [localTips, setLocalTips] = useState<Record<string, string>>({}); // course-specific tips not yet saved

  // Auto-select first published course
  useEffect(() => {
    if (courses && !selectedCourseId) {
      const first = courses.find((c) => c.status === "published") ?? courses[0];
      if (first) setSelectedCourseId(first._id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses?.find((c) => c._id === selectedCourseId) ?? null;

  async function handleGetTip(milestoneId: string) {
    if (!data?.mentorContext) return;
    setLoadingTip(milestoneId);
    setExpandedTip(milestoneId);
    try {
      const res = await fetch("/api/generate/milestone-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          courseTitle: selectedCourse?.title ?? data.mentorContext.courseTitle,
          targetAudience: selectedCourse?.targetAudience ?? data.mentorContext.targetAudience,
          expertise: data.mentorContext.expertise,
          priceCents: selectedCourse?.priceCents ?? data.mentorContext.priceCents,
        }),
      });
      if (res.ok) {
        const { tip } = await res.json();
        setLocalTips((prev) => ({ ...prev, [milestoneId]: tip }));
      }
    } finally {
      setLoadingTip(null);
    }
  }

  if (!data || !courses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pct = Math.round((data.completedCount / data.milestones.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Growth Milestones</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your roadmap to your first 100 students — with AI tips tailored to your course.
        </p>
      </div>

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                AI tips based on course:
              </p>
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => {
                      setSelectedCourseId(course._id);
                      setExpandedTip(null);
                      setLocalTips({}); // clear tips when switching course
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                      selectedCourseId === course._id
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    {course.title}
                    {course.status === "draft" && (
                      <span className="ml-1.5 text-[10px] opacity-70">(draft)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {data.completedCount} of {data.milestones.length} milestones completed
            </span>
          </div>
          <span className="text-2xl font-bold text-teal-600">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
          <div
            className="bg-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{data.totalStudents} students total</span>
          <span>${(data.totalRevenueCents / 100).toFixed(0)} earned total</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {data.milestones.map((milestone, index) => {
          const isExpanded = expandedTip === milestone.id;
          const currentTip = localTips[milestone.id] ?? null;
          const hasTip = !!currentTip;
          const isLoadingThisTip = loadingTip === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                milestone.completed
                  ? "border-teal-200 dark:border-teal-800"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Number / Check */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  milestone.completed
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                  {milestone.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>

                {/* Icon + Label */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{milestoneIcons[milestone.id]}</span>
                    <p className={`font-medium text-sm ${
                      milestone.completed
                        ? "text-slate-400 dark:text-slate-500 line-through"
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {milestone.label}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!milestone.completed && !milestone.auto && (
                    <button
                      onClick={() => markComplete({ milestoneId: milestone.id })}
                      className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Mark done
                    </button>
                  )}
                  {!milestone.completed && (
                    <button
                      onClick={() => hasTip ? setExpandedTip(isExpanded ? null : milestone.id) : handleGetTip(milestone.id)}
                      disabled={isLoadingThisTip}
                      className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-2.5 py-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors disabled:opacity-50"
                    >
                      {isLoadingThisTip ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {hasTip ? (isExpanded ? "Hide tip" : "Show tip") : "Get AI tip"}
                    </button>
                  )}
                </div>
              </div>

              {/* AI Tip */}
              {isExpanded && (hasTip || isLoadingThisTip) && (
                <div className="px-5 pb-4">
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg p-4">
                    {isLoadingThisTip && !hasTip ? (
                      <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating your personalized tip for "{selectedCourse?.title}"...
                      </div>
                    ) : (
                      <>
                        {selectedCourse && (
                          <p className="text-xs text-teal-500 dark:text-teal-500 mb-2 font-medium">
                            Tip for: {selectedCourse.title}
                          </p>
                        )}
                        <p className="text-sm text-teal-800 dark:text-teal-300 leading-relaxed">
                          {currentTip}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
