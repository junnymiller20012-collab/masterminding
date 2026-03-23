"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft, Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default function CourseAnalyticsPage({ params }: Props) {
  const { id } = use(params);
  const data = useQuery(api.courses.getAnalytics, { courseId: id as Id<"courses"> });

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Students", value: data.enrollmentCount, icon: Users, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/30" },
    { label: "Total Revenue", value: `$${(data.totalRevenueCents / 100).toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Completion Rate", value: `${data.completionRate}%`, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
    {
      label: "Avg Progress",
      value: data.students.length > 0
        ? `${Math.round(data.students.reduce((s, p) => s + p.progressPct, 0) / data.students.length)}%`
        : "0%",
      icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/courses" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{data.course.title}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-800 dark:text-white">Enrolled Students</h2>
        </div>

        {data.students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No students yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Students will appear here after enrolling.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Student</th>
                  <th className="text-left px-6 py-3">Enrolled</th>
                  <th className="text-left px-6 py-3">Paid</th>
                  <th className="text-left px-6 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.students.map((student) => (
                  <tr key={student.learnerId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{student.learnerName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{student.learnerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      ${(student.amountPaidCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 min-w-[80px]">
                          <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${student.progressPct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-9 text-right">
                          {student.progressPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
