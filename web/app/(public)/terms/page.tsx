import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — MasterMinding",
  description: "Terms of Service for MasterMinding — the course platform for mentors.",
};

export default function TermsPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: March 27, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MasterMinding ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
            <p>MasterMinding is an online platform that allows mentors and educators ("Mentors") to create, publish, and sell educational courses to students ("Learners"). MasterMinding provides the technology infrastructure — including storefronts, payment processing, and course delivery — but does not create course content.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Accounts</h2>
            <p>You must create an account to use the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate, complete information when registering.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Mentor Terms</h2>
            <p>As a Mentor, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Only publish content you own or have the right to distribute</li>
              <li>Not publish misleading, harmful, illegal, or infringing content</li>
              <li>Accurately describe your courses and deliver what you promise</li>
              <li>Pay a 10% platform fee on each course sale processed through the Platform</li>
              <li>Comply with all applicable laws regarding your content and audience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Learner Terms</h2>
            <p>As a Learner, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use course content for personal educational purposes only</li>
              <li>Not share, reproduce, or redistribute paid course content</li>
              <li>Not attempt to circumvent payment systems to access paid courses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Payments</h2>
            <p>Payments are processed through Lemon Squeezy. MasterMinding collects a 10% platform fee per transaction. Mentors receive 90% of each sale. Payouts are sent via bank transfer or Wise. MasterMinding is not responsible for delays caused by third-party payment processors.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Intellectual Property</h2>
            <p>Mentors retain full ownership of their course content. By publishing on MasterMinding, Mentors grant MasterMinding a limited license to host, display, and deliver the content to enrolled Learners. MasterMinding's platform, branding, and technology remain the exclusive property of MasterMinding.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Prohibited Conduct</h2>
            <p>You may not use the Platform to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violate any applicable law or regulation</li>
              <li>Publish illegal, harmful, or abusive content</li>
              <li>Spam, phish, or defraud other users</li>
              <li>Attempt to hack, disrupt, or reverse-engineer the Platform</li>
              <li>Create multiple accounts to abuse free trials or promotions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Termination</h2>
            <p>MasterMinding reserves the right to suspend or terminate any account that violates these Terms, without prior notice. Upon termination, your access to the Platform will cease. Outstanding payout balances will be settled within 30 days of termination, unless the account was terminated for fraud.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Disclaimers</h2>
            <p>The Platform is provided "as is." MasterMinding makes no warranties about the accuracy, reliability, or availability of the service. MasterMinding is not responsible for the content, quality, or accuracy of courses published by Mentors.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MasterMinding shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">13. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:support@masterminding.app" className="text-[#0F766E] hover:underline">support@masterminding.app</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} MasterMinding. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
