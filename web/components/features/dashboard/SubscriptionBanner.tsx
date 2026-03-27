"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  status: "past_due" | "canceled" | "inactive";
}

export function SubscriptionBanner({ status }: Props) {
  const isPastDue = status === "past_due";

  return (
    <div className={`flex items-center justify-between px-5 py-3 rounded-lg mb-6 ${
      isPastDue ? "bg-red-50 border border-red-200" : "bg-teal-50 border border-teal-200"
    }`}>
      <div className="flex items-center gap-3">
        {isPastDue
          ? <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          : <AlertTriangle className="w-5 h-5 text-teal-500 shrink-0" />
        }
        <p className={`text-sm font-medium ${isPastDue ? "text-red-700" : "text-teal-700"}`}>
          {isPastDue
            ? "There was an issue with your account — contact support@masterminding.app"
            : "Welcome! Start by creating your first course and sharing your storefront link."}
        </p>
      </div>
      <Link
        href="/courses/new"
        className={`text-sm font-semibold ml-4 shrink-0 ${
          isPastDue ? "text-red-600 hover:text-red-700" : "text-teal-600 hover:text-teal-700"
        }`}
      >
        {isPastDue ? "Contact support →" : "Create course →"}
      </Link>
    </div>
  );
}
