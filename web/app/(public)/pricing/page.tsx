import Link from "next/link";
import { GraduationCap, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MasterMinding",
  description: "MasterMinding is free to start. We only charge 10% per course sale — you keep 90% of every sale.",
};

const features = [
  "Publish unlimited courses",
  "AI-generated sales pages that convert",
  "Built-in payments via Lemon Squeezy",
  "Real-time enrollment analytics dashboard",
  "Professional storefront learners trust",
  "Coupon & discount code support",
  "Video hosting included",
  "Mobile app for learners",
  "Email notifications for every sale",
  "No monthly fee — ever",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="border-b border-slate-100 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">MasterMinding</span>
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-semibold bg-[#0F766E] hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Get started free
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, fair pricing
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Free to start. We only earn when you earn — 10% per sale, and you keep the rest.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border-2 border-[#0F766E] rounded-2xl p-8 shadow-lg mb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-[#0F766E] uppercase tracking-wide mb-2">MasterMinding</p>
            <div className="text-6xl font-bold text-slate-900 dark:text-white mb-1">
              Free
            </div>
            <p className="text-slate-500 dark:text-slate-400">to get started</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-sm font-semibold px-4 py-2 rounded-full">
              10% per sale — you keep 90%
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="block w-full text-center bg-[#0F766E] hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Start for free →
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Is there a monthly subscription?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No. MasterMinding is completely free to use. We only charge a 10% fee when you make a sale. No monthly fee, no setup fee.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">How does the 10% fee work?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">When a learner buys your course, MasterMinding keeps 10% and you receive 90%. For example, if you sell a $100 course, you earn $90.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">How do I get paid?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Payouts are made via bank transfer or Wise. Contact support@masterminding.app to set up your payout method.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Are there limits on the number of courses I can publish?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No limits. Publish as many courses as you want, with as many lessons as you need.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">What payment methods are accepted?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Learners can pay with all major credit cards and PayPal. Payments are processed securely by Lemon Squeezy.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} MasterMinding. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
