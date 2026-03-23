"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle, Banknote } from "lucide-react";

export default function PayoutsPage() {
  const mentor = useQuery(api.mentors.getMe);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "1";

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect-account", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  const isConnected = mentor?.stripeAccountStatus === "active";
  const isPending = mentor?.stripeAccountStatus === "pending";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Payouts</h1>

      {justConnected && (
        <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Stripe account connected! Payouts will be sent automatically after each sale.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Stripe Connect Account</p>
            <p className="text-sm text-slate-500 mt-0.5">Receive automatic payouts after each sale</p>
          </div>
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
              <CheckCircle className="w-3.5 h-3.5" /> Connected
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> Pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              Not connected
            </span>
          )}
        </div>

        {mentor && (
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Lifetime Earnings</p>
            <p className="text-3xl font-bold text-slate-900">
              ${((mentor as any).totalRevenueCents ?? 0 / 100).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">After 10% platform fee</p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          {isConnected ? (
            <a
              href="https://dashboard.stripe.com/express"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              <Banknote className="w-4 h-4" />
              View on Stripe Dashboard ↗
            </a>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              {loading ? "Loading..." : "Connect Stripe Account →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
