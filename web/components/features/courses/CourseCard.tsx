"use client";

import Link from "next/link";
import { Users, DollarSign, BookOpen, BarChart2, Edit, Trash2, Copy, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

interface Props {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  enrollmentCount: number;
  totalRevenueCents: number;
  priceCents: number;
  coverImageUrl?: string;
  slug?: string;
  mentorSlug?: string;
}

const statusStyles = {
  published: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  draft: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  archived: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
};

export function CourseCard({ id, title, status, enrollmentCount, totalRevenueCents, priceCents, coverImageUrl, slug, mentorSlug }: Props) {
  const removeCourse = useMutation(api.courses.remove);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!slug || !mentorSlug) return;
    const url = `https://www.masterminding.app/${mentorSlug}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await removeCourse({ courseId: id as Id<"courses"> });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-36 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-10 h-10 text-white/60" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[status]}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {enrollmentCount} students
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            ${(totalRevenueCents / 100).toFixed(0)} earned
          </span>
        </div>

        {status === "published" && slug && mentorSlug && (
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 py-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors mb-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Link copied!" : "Copy student link"}
          </button>
        )}

        <div className="flex gap-2">
          <Link
            href={`/courses/${id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <Link
            href={`/courses/${id}/analytics`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analytics
          </Link>
          {status === "draft" && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center px-2.5 border border-red-200 dark:border-red-900 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
