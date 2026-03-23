"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle, AlertTriangle, XCircle, CreditCard } from "lucide-react";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-sm text-slate-400">No subscription</span>;
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    active:   { label: "Active",    cls: "bg-teal-100 text-teal-700",   icon: CheckCircle },
    trialing: { label: "Trial",     cls: "bg-blue-100 text-blue-700",   icon: CheckCircle },
    past_due: { label: "Past due",  cls: "bg-red-100 text-red-700",     icon: XCircle },
    canceled: { label: "Canceled",  cls: "bg-slate-100 text-slate-500", icon: AlertTriangle },
    incomplete:{ label: "Incomplete",cls:"bg-amber-100 text-amber-700", icon: AlertTriangle },
  };
  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-500", icon: AlertTriangle };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

export default function BillingPage() {
  const mentor = useQuery(api.mentors.getMe);
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal-session", { method: "POST" });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else alert(error ?? "Could not open billing portal");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription-session", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  const isActive = mentor?.subscriptionStatus === "active" || mentor?.subscriptionStatus === "trialing";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Billing</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">MasterMinding Subscription</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">$29/month + 10% per course sale</p>
          </div>
          <StatusBadge status={mentor?.subscriptionStatus} />
        </div>

        {mentor?.subscriptionCurrentPeriodEnd && (
          <p className="text-sm text-slate-500">
            {isActive ? "Renews" : "Expires"}{" "}
            {new Date(mentor.subscriptionCurrentPeriodEnd).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <CreditCard className="w-4 h-4 text-slate-400" />
          {isActive ? (
            <button
              onClick={handlePortal}
              disabled={loading}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Manage Subscription →"}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Subscribe Now →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
