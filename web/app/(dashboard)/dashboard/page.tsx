"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Header } from "@/components/features/dashboard/Header";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { ActivityFeed } from "@/components/features/dashboard/ActivityFeed";
import { EmptyState } from "@/components/features/dashboard/EmptyState";
import { SubscriptionBanner } from "@/components/features/dashboard/SubscriptionBanner";
import { Card } from "@/components/ui/Card";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();
  const stats = useQuery(api.mentors.getDashboard);
  const mentor = useQuery(api.mentors.getMe);
  const { t } = useLanguage();

  const isNew = stats?.publishedCourseCount === 0 && stats?.totalEnrollments === 0;

  return (
    <>
      <Header title={t.navDashboard} />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {mentor?.subscriptionStatus === "past_due" && (
          <SubscriptionBanner status="past_due" />
        )}
        {mentor?.subscriptionStatus === "canceled" && (
          <SubscriptionBanner status="canceled" />
        )}
        {!mentor?.subscriptionStatus && mentor && (
          <SubscriptionBanner status="inactive" />
        )}
        {stats === undefined || mentor === undefined ? (
          /* Loading skeleton */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
              ))}
            </div>
          </>
        ) : isNew || !mentor ? (
          <EmptyState name={user?.firstName ?? undefined} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard
                label={t.totalEnrollments}
                value={stats?.totalEnrollments ?? 0}
              />
              <StatCard
                label={t.totalRevenue}
                value={`$${((stats?.totalRevenueCents ?? 0) / 100).toFixed(2)}`}
              />
              <StatCard
                label={t.publishedCourses}
                value={stats?.publishedCourseCount ?? 0}
              />
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.overallCompletionRate ?? 0}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Completion Rate</p>
              </div>
            </div>

            {/* Recent activity */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                {t.recentEnrollments}
              </h2>
              <ActivityFeed
                enrollments={(stats?.recentEnrollments ?? []) as any}
              />
            </Card>
          </>
        )}
      </div>
    </>
  );
}
