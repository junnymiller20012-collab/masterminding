import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MasterMinding",
  description: "Privacy Policy for MasterMinding — the course platform for mentors.",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: March 27, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
            <p>MasterMinding ("we", "us", or "our") operates the MasterMinding platform at masterminding.app. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account information:</strong> name, email address, and profile details you provide when registering</li>
              <li><strong>Payment information:</strong> transaction records processed through Lemon Squeezy (we do not store full payment card details)</li>
              <li><strong>Course data:</strong> courses you create, purchase, or enroll in</li>
              <li><strong>Usage data:</strong> pages visited, features used, and interactions with the platform</li>
              <li><strong>Communications:</strong> messages you send to our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process payments and deliver courses you purchase</li>
              <li>Send transactional emails (enrollment confirmations, payout notifications)</li>
              <li>Respond to support requests</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Sharing Your Information</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Lemon Squeezy:</strong> our payment processor, for handling transactions</li>
              <li><strong>Resend:</strong> our email provider, for sending transactional emails</li>
              <li><strong>Convex:</strong> our backend database provider</li>
              <li><strong>Vercel:</strong> our hosting provider</li>
              <li>Law enforcement or regulators when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Cookies</h2>
            <p>We use essential cookies to keep you logged in and to maintain your session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but some parts of the Platform may not function correctly without them.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:support@masterminding.app" className="text-[#0F766E] hover:underline">support@masterminding.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Security</h2>
            <p>We use industry-standard security measures including HTTPS encryption, secure authentication, and access controls. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Children's Privacy</h2>
            <p>MasterMinding is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the Platform. Continued use of the Platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Contact</h2>
            <p>Questions about this Privacy Policy? Email us at <a href="mailto:support@masterminding.app" className="text-[#0F766E] hover:underline">support@masterminding.app</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} MasterMinding. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
