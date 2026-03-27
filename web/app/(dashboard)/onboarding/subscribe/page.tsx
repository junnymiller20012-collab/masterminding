"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const benefits = [
  "Publish unlimited courses",
  "AI-generated sales pages that convert",
  "Built-in payments via Lemon Squeezy",
  "Real-time dashboard with enrollment analytics",
  "Professional storefront learners trust",
];

export default function SubscribePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-[#0F766E] text-white">
                {step <= 2 ? "✓" : step}
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
            Free
            <span className="text-lg font-normal text-slate-500 dark:text-slate-400"> to start</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            10% per course sale — you keep 90%
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

        <Button onClick={() => router.push("/onboarding/connect-stripe")} className="w-full">
          Continue →
        </Button>
      </div>
    </div>
  );
}
