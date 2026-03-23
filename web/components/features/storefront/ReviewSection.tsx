"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface Props {
  courseId: Id<"courses">;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`w-5 h-5 ${(hover || value) >= s ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ courseId }: Props) {
  const { isSignedIn } = useUser();
  const data = useQuery(api.reviews.getReviewsByCourse, { courseId });
  const myReview = useQuery(api.reviews.getMyReview, { courseId });
  const submitReview = useMutation(api.reviews.submitReview);
  const enrollment = useQuery(api.enrollments.checkEnrollment, isSignedIn ? { courseId } : "skip");

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    setSubmitting(true);
    try {
      await submitReview({ courseId, rating, body: body || undefined });
      toast.success("Review submitted!");
      setRating(0);
      setBody("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;
  if (data.count === 0 && !enrollment) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
        {data.count > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">{data.avgRating}</span>
            <span className="text-slate-400 text-sm">({data.count})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {enrollment && !myReview && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-5 mb-6">
          <p className="font-medium text-slate-900 text-sm mb-3">Leave a review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="w-full mt-3 px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
          <button
            type="submit"
            disabled={!rating || submitting}
            className="mt-3 bg-[#0F766E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {data.reviews.length > 0 && (
        <div className="space-y-4">
          {data.reviews.map((r) => (
            <div key={r._id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  {r.learnerAvatarUrl ? (
                    <img src={r.learnerAvatarUrl} alt={r.learnerName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-teal-700">{r.learnerName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.learnerName}</p>
                  <StarRating value={r.rating} />
                </div>
              </div>
              {r.body && <p className="text-sm text-slate-600 leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
