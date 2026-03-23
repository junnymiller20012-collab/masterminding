"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ConnectStripePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-connect-link", {
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
                  step <= 3
                    ? "bg-[#0F766E] text-white"
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {step < 3 ? "✓" : step}
              </div>
              {step < 3 && <div className="w-12 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Connect your bank account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          We use Stripe to send you payouts automatically. Your banking info is
          secured by Stripe — we never see your account details.
        </p>

        <div className="space-y-3 mb-8">
          {[
            { icon: Banknote, text: "Get paid automatically after each sale" },
            { icon: Zap, text: "Payouts sent within 2 business days" },
            { icon: Shield, text: "Bank-level security via Stripe" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#0F766E]" />
              </div>
              {text}
            </div>
          ))}
        </div>

        <Button onClick={handleConnect} loading={loading} className="w-full">
          Connect Stripe Account
        </Button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip for now — I'll do this later
        </button>
      </div>
    </div>
  );
}
