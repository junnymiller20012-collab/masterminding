"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tag, X } from "lucide-react";

interface Props {
  courseId: Id<"courses">;
  priceCents: number;
}

export function EnrollButton({ courseId, priceCents }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const enrollment = useQuery(api.enrollments.checkEnrollment, isSignedIn ? { courseId } : "skip");
  const createCheckout = useAction(api.enrollments.createCheckoutSession);
  const enrollFree = useAction(api.enrollments.enrollFree);
  const couponResult = useQuery(
    api.coupons.validate,
    appliedCode ? { code: appliedCode, courseId } : "skip"
  );

  if (!isLoaded) return null;

  if (enrollment) {
    return (
      <button
        onClick={() => router.push(`/learn/${courseId}`)}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-teal-700 transition-colors"
      >
        Continue Learning →
      </button>
    );
  }

  const discountPercent = couponResult?.discountPercent ?? 0;
  const finalPrice = discountPercent > 0
    ? Math.round(priceCents * (1 - discountPercent / 100))
    : priceCents;

  function handleApplyCoupon() {
    if (couponInput.trim()) setAppliedCode(couponInput.trim().toUpperCase());
  }

  function handleRemoveCoupon() {
    setAppliedCode("");
    setCouponInput("");
    setShowCoupon(false);
  }

  async function handleEnroll() {
    if (!isSignedIn) {
      openSignIn({ redirectUrl: window.location.href });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (priceCents === 0) {
        await enrollFree({ courseId });
        router.push(`/learn/${courseId}`);
      } else {
        const url = await createCheckout({
          courseId,
          couponCode: appliedCode || undefined,
        });
        window.location.href = url;
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  const priceLabel = priceCents === 0
    ? "Free"
    : discountPercent > 0
      ? `$${(finalPrice / 100).toFixed(2)}`
      : `$${(priceCents / 100).toFixed(2)}`;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-[#0F766E] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-[#0D6D65] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? "Redirecting..." : `Enroll Now — ${priceLabel} →`}
      </button>

      {/* Original price crossed out when coupon applied */}
      {discountPercent > 0 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm line-through text-slate-400">${(priceCents / 100).toFixed(2)}</span>
          <span className="text-sm font-semibold text-teal-600">{discountPercent}% off applied!</span>
        </div>
      )}

      {/* Coupon section */}
      {priceCents > 0 && (
        <div className="text-center">
          {!showCoupon && !appliedCode && (
            <button
              onClick={() => setShowCoupon(true)}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline-offset-2 hover:underline transition-colors"
            >
              Have a coupon code?
            </button>
          )}

          {showCoupon && !appliedCode && (
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="COUPONCODE"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCoupon(false)}
                className="text-slate-400 hover:text-slate-600 px-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {appliedCode && (
            <div className="flex items-center justify-center gap-2 mt-1">
              {couponResult === undefined ? (
                <span className="text-xs text-slate-400">Checking code…</span>
              ) : couponResult === null ? (
                <>
                  <span className="text-xs text-red-500">Invalid or expired coupon</span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-slate-400 hover:text-slate-600 underline">
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    ✓ {couponResult.code} — {couponResult.discountPercent}% off
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
