"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Header } from "@/components/features/dashboard/Header";
import { Copy, Check, Link2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AffiliatesPage() {
  const links = useQuery(api.affiliates.getMyAffiliateLinks);
  const courses = useQuery(api.courses.listByMentor);
  const generateLink = useMutation(api.affiliates.generateAffiliateLink);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const appUrl = "https://www.masterminding.app";

  async function handleGenerate(courseId: string) {
    setGenerating(courseId);
    try {
      const code = await generateLink({ courseId: courseId as any });
      toast.success("Affiliate link created!");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate link");
    } finally {
      setGenerating(null);
    }
  }

  function copyLink(code: string, mentorSlug: string, courseSlug: string) {
    const url = `${appUrl}/${mentorSlug}/${courseSlug}?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Link copied!");
  }

  const totalEarned = (links ?? []).reduce((s, l) => s + l.totalEarnedCents, 0);
  const totalReferrals = (links ?? []).reduce((s, l) => s + l.totalReferrals, 0);

  return (
    <>
      <Header title="Affiliates" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Affiliate Program</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Share your courses with affiliates and reward them with a commission on every sale they drive.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Referrals</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalReferrals}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Earned</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">${(totalEarned / 100).toFixed(2)}</p>
          </div>
        </div>

        {/* Generate links for courses */}
        {courses && courses.filter(c => c.status === "published").length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Generate Affiliate Links</h3>
            <div className="space-y-3">
              {courses.filter(c => c.status === "published").map((course) => {
                const existing = links?.find(l => l.courseId === course._id);
                return (
                  <div key={course._id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{course.title}</p>
                    {existing ? (
                      <button
                        onClick={() => copyLink(existing.referralCode, existing.mentorSlug, existing.courseSlug)}
                        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors shrink-0"
                      >
                        {copied === existing.referralCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied === existing.referralCode ? "Copied!" : "Copy link"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerate(course._id)}
                        disabled={generating === course._id}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {generating === course._id ? "Creating..." : "Create link"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active affiliate links */}
        {links && links.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Links</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {links.map((link) => (
                <div key={link._id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{link.courseTitle}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">?ref={link.referralCode}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    <span>{link.totalReferrals} sales</span>
                    <span className="font-medium text-teal-700 dark:text-teal-400">{link.commissionPercent}% commission</span>
                    <button
                      onClick={() => copyLink(link.referralCode, link.mentorSlug, link.courseSlug)}
                      className="flex items-center gap-1.5 font-medium text-teal-600 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 px-2.5 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      {copied === link.referralCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> Affiliate payouts are processed manually. We'll contact affiliates when their balance reaches $50.
          </p>
        </div>
      </div>
    </>
  );
}
