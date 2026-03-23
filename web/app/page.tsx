import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  // Signed-in users go straight to dashboard
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">MasterMinding</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium bg-[#0F766E] text-white px-4 py-2 rounded-lg hover:bg-[#0D6D65] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-[#0F766E] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          Built for mentors, by marketers
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 max-w-2xl leading-tight mb-6">
          Turn your knowledge into a{" "}
          <span className="text-[#0F766E]">consistently selling</span> course
          business
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mb-10">
          MasterMinding gives mentors a professional storefront, AI-generated
          sales pages, and built-in payments — so you spend less time on tech
          and more time teaching.
        </p>
        <div className="flex gap-3">
          <Link
            href="/sign-up"
            className="bg-[#0F766E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors"
          >
            Launch your course in 30 minutes
          </Link>
          <Link
            href="/sign-in"
            className="border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
