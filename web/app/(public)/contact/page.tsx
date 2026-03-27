import Link from "next/link";
import { GraduationCap, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — MasterMinding",
  description: "Get in touch with the MasterMinding team for support, billing questions, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="border-b border-slate-100 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">MasterMinding</span>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Contact us</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg">
          We're here to help. Reach out and we'll get back to you within one business day.
        </p>

        <div className="space-y-4">
          {/* Email */}
          <a
            href="mailto:support@masterminding.app"
            className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#0F766E] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#0F766E]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0F766E] transition-colors">Email support</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">support@masterminding.app</p>
              <p className="text-xs text-slate-400 mt-1">For billing, payouts, account issues, and general questions</p>
            </div>
          </a>

          {/* General inquiries */}
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#0F766E]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Partnerships & press</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">hello@masterminding.app</p>
              <p className="text-xs text-slate-400 mt-1">For partnership inquiries, media requests, and collaboration</p>
            </div>
          </div>
        </div>

        {/* Common topics */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Common questions</h2>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">How do I set up my payout method?</p>
              <p className="mt-1">Email us at support@masterminding.app with your preferred payout method (bank transfer or Wise) and we'll set it up for you.</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">When do I receive my earnings?</p>
              <p className="mt-1">Payouts are processed monthly. We'll send your earnings via your configured payout method within the first week of each month.</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">How do I report a problem with a course?</p>
              <p className="mt-1">Contact us at support@masterminding.app with the course name and a description of the issue. We'll investigate promptly.</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">How do I delete my account?</p>
              <p className="mt-1">Email support@masterminding.app from your registered email address and request account deletion. We'll process it within 48 hours.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} MasterMinding. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
