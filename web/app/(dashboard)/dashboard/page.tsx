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

export default function DashboardPage() {
  const { user } = useUser();
  const stats = useQuery(api.mentors.getDashboard);
  const mentor = useQuery(api.mentors.getMe);

  const isNew = stats?.publishedCourseCount === 0 && stats?.totalEnrollments === 0;

  return (
    <>
      <Header title="Dashboard" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Total enrollments"
                value={stats?.totalEnrollments ?? 0}
              />
              <StatCard
                label="Total revenue"
                value={`$${((stats?.totalRevenueCents ?? 0) / 100).toFixed(2)}`}
              />
              <StatCard
                label="Published courses"
                value={stats?.publishedCourseCount ?? 0}
              />
            </div>

            {/* Recent activity */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Recent enrollments
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
