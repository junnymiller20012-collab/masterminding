"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle, Banknote, Clock } from "lucide-react";

export default function PayoutsPage() {
  const mentor = useQuery(api.mentors.getMe);
  const payments = useQuery(api.payments.listByMentor);

  const totalEarnedCents = (payments ?? []).reduce(
    (sum, p) => sum + p.mentorPayoutCents,
    0
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payouts</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        You receive 90% of every sale. Payouts are sent manually by the platform team via bank transfer or Wise.
      </p>

      {/* Earnings summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Your Total Earnings (90% of sales)
        </p>
        <p className="text-4xl font-bold text-slate-900 dark:text-white">
          ${(totalEarnedCents / 100).toFixed(2)}
        </p>
        <p className="text-xs text-slate-400 mt-1">After 10% platform fee</p>
      </div>

      {/* How payouts work */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="w-4 h-4 text-teal-600" />
          <p className="font-semibold text-teal-800 dark:text-teal-300 text-sm">How you get paid</p>
        </div>
        <ul className="space-y-2 text-sm text-teal-700 dark:text-teal-400">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            Student buys your course — payment processed instantly
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            You keep 90% of every sale
          </li>
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            Payouts sent weekly via Wise or bank transfer — contact support@masterminding.app to set up your payout method
          </li>
        </ul>
      </div>

      {/* Recent sales */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <p className="font-semibold text-slate-800 dark:text-white mb-4">Recent Sales</p>
        {!payments || payments.length === 0 ? (
          <p className="text-sm text-slate-400">No sales yet — share your course link to get started.</p>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 10).map((p) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{p.courseTitle ?? "Course"}</p>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-teal-600">+${(p.mentorPayoutCents / 100).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">your cut</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
