"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";

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

  const enrollment = useQuery(api.enrollments.checkEnrollment, isSignedIn ? { courseId } : "skip");
  const createCheckout = useMutation(api.enrollments.createCheckoutSession);

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

  async function handleEnroll() {
    if (!isSignedIn) {
      openSignIn({ redirectUrl: window.location.href });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckout({ courseId });
      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-[#0F766E] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-[#0D6D65] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? "Redirecting..." : `Enroll Now — $${(priceCents / 100).toFixed(2)} →`}
      </button>
    </div>
  );
}
