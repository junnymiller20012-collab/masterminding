"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle, CreditCard, Banknote } from "lucide-react";

export default function BillingPage() {
  const mentor = useQuery(api.mentors.getMe);
  const payments = useQuery(api.payments.listByMentor);

  const totalRevenueCents = (payments ?? []).reduce((sum, p) => sum + p.amountCents, 0);
  const totalPayoutCents = (payments ?? []).reduce((sum, p) => sum + p.mentorPayoutCents, 0);
  const totalFeeCents = (payments ?? []).reduce((sum, p) => sum + p.platformFeeCents, 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Billing</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        MasterMinding charges 10% per course sale — no monthly fee.
      </p>

      {/* Plan */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">MasterMinding Free Plan</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">10% per course sale — you keep 90%</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
            <CheckCircle className="w-3.5 h-3.5" /> Active
          </span>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <p className="text-sm text-slate-500">Payments processed by Lemon Squeezy</p>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Revenue Summary</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Total course sales</span>
            <span className="font-semibold text-slate-900 dark:text-white">${(totalRevenueCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Platform fee (10%)</span>
            <span className="font-semibold text-red-500">−${(totalFeeCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="font-semibold text-slate-800 dark:text-white">Your earnings (90%)</span>
            <span className="font-bold text-teal-600">${(totalPayoutCents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payout info */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="w-4 h-4 text-teal-600" />
          <p className="font-semibold text-teal-800 dark:text-teal-300 text-sm">Payout questions?</p>
        </div>
        <p className="text-sm text-teal-700 dark:text-teal-400">
          Contact us at{" "}
          <a href="mailto:support@masterminding.app" className="underline font-medium">
            support@masterminding.app
          </a>{" "}
          to set up or update your payout method (Wise or bank transfer).
        </p>
      </div>
    </div>
  );
}
