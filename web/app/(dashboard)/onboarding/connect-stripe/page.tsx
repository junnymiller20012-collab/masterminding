"use client";

import { useRouter } from "next/navigation";
import { Banknote, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ConnectStripePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-[#0F766E] text-white">
                ✓
              </div>
              {step < 3 && <div className="w-12 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          You're all set! 🎉
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          You can start selling right away. Payouts are sent weekly to your bank account or Wise — contact us at support@masterminding.app to confirm your payout details.
        </p>

        <div className="space-y-3 mb-8">
          {[
            { icon: Banknote, text: "90% of every sale goes to you" },
            { icon: Zap, text: "Payouts sent weekly via Wise or bank transfer" },
            { icon: Shield, text: "Payments secured by Lemon Squeezy" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#0F766E]" />
              </div>
              {text}
            </div>
          ))}
        </div>

        <Button onClick={() => router.push("/dashboard")} className="w-full">
          Go to Dashboard →
        </Button>
      </div>
    </div>
  );
}
