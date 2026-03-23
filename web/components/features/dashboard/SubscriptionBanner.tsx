"use client";

import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  status: "past_due" | "canceled" | "inactive";
}

export function SubscriptionBanner({ status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal-session", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      router.push("/onboarding/subscribe");
    } finally {
      setLoading(false);
    }
  }

  const isPastDue = status === "past_due";

  return (
    <div className={`flex items-center justify-between px-5 py-3 rounded-lg mb-6 ${
      isPastDue ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"
    }`}>
      <div className="flex items-center gap-3">
        {isPastDue
          ? <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        }
        <p className={`text-sm font-medium ${isPastDue ? "text-red-700" : "text-amber-700"}`}>
          {isPastDue
            ? "Your payment failed — update your billing to keep courses live"
            : "Your subscription is inactive — subscribe to publish courses"}
        </p>
      </div>
      <button
        onClick={handleManage}
        disabled={loading}
        className={`text-sm font-semibold ml-4 shrink-0 ${
          isPastDue ? "text-red-600 hover:text-red-700" : "text-amber-600 hover:text-amber-700"
        }`}
      >
        {loading ? "Loading..." : isPastDue ? "Fix billing →" : "Subscribe →"}
      </button>
    </div>
  );
}
