"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const benefits = [
  "Publish unlimited courses",
  "AI-generated sales pages that convert",
  "Built-in payments & automatic payouts",
  "Real-time dashboard with enrollment analytics",
  "Professional storefront learners trust",
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription-session", {
        method: "POST",
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  step <= 2
                    ? "bg-[#0F766E] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                ].join(" ")}
              >
                {step === 1 ? "✓" : step}
              </div>
              {step < 3 && <div className="w-12 h-px bg-slate-200 dark:bg-slate-700" />}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
            MasterMinding Platform
          </p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white">
            $29
            <span className="text-lg font-normal text-slate-500 dark:text-slate-400">/month</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            + 10% per course sale — you keep the rest
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        <Button onClick={handleSubscribe} loading={loading} className="w-full">
          Subscribe & Start Selling
        </Button>

        <button
          onClick={() => router.push("/onboarding/connect-stripe")}
          className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
