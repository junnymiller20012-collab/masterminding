import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Sparkles, CreditCard, BarChart3, Globe, Zap, Shield } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-slate-100 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm sm:text-base">MasterMinding</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5"
          >
            Sign in
          </Link>
          <Link href="/explore" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5">
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
        <div className="inline-flex items-center gap-1.5 bg-teal-50 text-[#0F766E] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Built for mentors, by marketers
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 max-w-2xl leading-tight mb-5">
          Turn your knowledge into a{" "}
          <span className="text-[#0F766E]">consistently selling</span>{" "}
          course business
        </h1>

        <p className="text-base sm:text-lg text-slate-500 max-w-xl mb-8 leading-relaxed">
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
            className="border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-center text-sm sm:text-base"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-4">No credit card required to start</p>
        <p className="text-xs text-slate-400 mt-2">
          or{" "}
          <Link href="/explore" className="text-teal-600 hover:underline">
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
              desc: "Stripe handles checkout. You get paid automatically after every sale, with payouts in 2 business days.",
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
              className="bg-slate-50 rounded-2xl p-5 sm:p-6 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0F766E]" />
              </div>
              <p className="font-semibold text-slate-900 mb-1.5 text-sm sm:text-base">{title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
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
          Join mentors already earning on MasterMinding. Set up your storefront today — it's free to start.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-[#0F766E] font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm sm:text-base"
        >
          Create your free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-600">MasterMinding</span>
        </div>
        <p>© {new Date().getFullYear()} MasterMinding. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hover:text-slate-600 transition-colors">Sign in</Link>
          <Link href="/sign-up" className="hover:text-slate-600 transition-colors">Get started</Link>
        </div>
      </footer>

    </div>
  );
}
