"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Users, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function StudentsPage() {
  const students = useQuery(api.enrollments.listMentorStudents);
  const [search, setSearch] = useState("");

  const filtered = (students ?? []).filter(
    (s) =>
      s.learnerName.toLowerCase().includes(search.toLowerCase()) ||
      s.learnerEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
        {students && students.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students or courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {students === undefined ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">No students yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Students will appear here after enrolling in your courses.</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors"
          >
            View Courses
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} {filtered.length === 1 ? "student" : "students"}
              {search && ` matching "${search}"`}
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Total Revenue: ${(students.reduce((s, e) => s + e.amountPaidCents, 0) / 100).toFixed(2)}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">No results found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-3">Student</th>
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-left px-6 py-3">Enrolled</th>
                    <th className="text-left px-6 py-3">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((s) => (
                    <tr key={s.enrollmentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                              {s.learnerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{s.learnerName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{s.learnerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/courses/${s.courseId}/analytics`}
                          className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium hover:underline"
                        >
                          {s.courseTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(s.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        ${(s.amountPaidCents / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
