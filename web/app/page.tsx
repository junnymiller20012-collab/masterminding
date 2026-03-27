import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Sparkles, CreditCard, BarChart3, Globe, Zap, Shield, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MasterMinding — Sell Your Courses Online",
  description:
    "Turn your knowledge into a consistently selling course business. MasterMinding gives mentors a professional storefront, AI-generated sales pages, and built-in payments — free to start, 10% per sale.",
  openGraph: {
    title: "MasterMinding — Sell Your Courses Online",
    description:
      "Free to start. Publish unlimited courses. AI sales pages. Built-in payments. 10% per sale — you keep 90%.",
    url: "https://www.masterminding.app",
    siteName: "MasterMinding",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MasterMinding — Sell Your Courses Online",
    description: "Turn your knowledge into a consistently selling course business. Free to start.",
  },
};

const testimonials = [
  {
    name: "Carlos M.",
    role: "Business coach",
    quote:
      "I launched my first course in under an hour. The AI-written sales page got me my first 3 students the same day.",
    stars: 5,
  },
  {
    name: "Sofia R.",
    role: "Language mentor",
    quote:
      "MasterMinding is the simplest platform I've tried. No tech headaches, just a beautiful storefront and payments that work.",
    stars: 5,
  },
  {
    name: "James K.",
    role: "Fitness coach",
    quote:
      "The analytics are exactly what I need — I see every enrollment and payout in real time. Highly recommend.",
    stars: 5,
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">

      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">MasterMinding</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1.5"
          >
            Sign in
          </Link>
          <Link href="/explore" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1.5">
            Browse courses
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium bg-[#0F766E] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0D6D65] transition-colors whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-5 py-16 sm:py-24">
        <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-[#0F766E] dark:text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Built for mentors, by marketers
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white max-w-2xl leading-tight mb-5">
          Turn your knowledge into a{" "}
          <span className="text-[#0F766E]">consistently selling</span>{" "}
          course business
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mb-8 leading-relaxed">
          MasterMinding gives mentors a professional storefront, AI-generated
          sales pages, and built-in payments — so you spend less time on tech
          and more time teaching.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/sign-up"
            className="bg-[#0F766E] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#0D6D65] transition-colors text-center text-sm sm:text-base"
          >
            Launch your course in 30 minutes
          </Link>
          <Link
            href="/sign-in"
            className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center text-sm sm:text-base"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">No credit card required to start</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          or{" "}
          <Link href="/explore" className="text-teal-600 dark:text-teal-400 hover:underline">
            browse existing courses →
          </Link>
        </p>
      </main>

      {/* Features */}
      <section className="px-5 sm:px-8 pb-16 sm:pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Globe,
              title: "Your own storefront",
              desc: "A beautiful public page at masterminding.app/your-name where students discover and buy your courses.",
            },
            {
              icon: Sparkles,
              title: "AI sales pages",
              desc: "Describe your course and AI writes a converting sales page in seconds — headlines, bullets, and all.",
            },
            {
              icon: CreditCard,
              title: "Built-in payments",
              desc: "Lemon Squeezy handles checkout. Learners pay with any major card or PayPal. You keep 90% of every sale.",
            },
            {
              icon: BarChart3,
              title: "Real-time analytics",
              desc: "See enrollments, revenue, and student activity the moment they happen — no third-party tools needed.",
            },
            {
              icon: Zap,
              title: "Launch in minutes",
              desc: "Create a course, set a price, and start selling — all in under 30 minutes with no technical setup.",
            },
            {
              icon: Shield,
              title: "You own everything",
              desc: "Your content, your students, your money. No revenue share beyond the 10% platform fee per sale.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 sm:p-6 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0F766E]" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm sm:text-base">{title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 sm:px-8 pb-16 sm:pb-24 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-10">
          What mentors are saying
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-8 mb-12 sm:mb-20 rounded-2xl bg-[#0F766E] px-6 py-10 sm:py-14 text-center max-w-5xl sm:mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Ready to start selling?
        </h2>
        <p className="text-teal-100 text-sm sm:text-base mb-6 max-w-md mx-auto">
          Join mentors already earning on MasterMinding. Set up your storefront today — it&apos;s free to start.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-[#0F766E] font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm sm:text-base"
        >
          Create your free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 py-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#0F766E] flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-300">MasterMinding</span>
          </div>
          <p>© {new Date().getFullYear()} MasterMinding. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/explore" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Browse courses</Link>
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
