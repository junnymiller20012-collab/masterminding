import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { GraduationCap, Award } from "lucide-react";
import Link from "next/link";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Certificate */}
        <div className="bg-white rounded-2xl border-4 border-[#0F766E] shadow-xl p-10 text-center print:shadow-none">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
              <Award className="w-8 h-8 text-[#0F766E]" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Certificate of Completion</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-6 h-6 rounded bg-[#0F766E] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-600">MasterMinding</span>
          </div>
          <p className="text-slate-500 text-sm mb-2">This certifies that</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">Course Completed</p>
          <p className="text-slate-500 text-sm mb-6">has successfully completed</p>
          <p className="text-xl font-semibold text-[#0F766E] mb-8">this course</p>
          <div className="border-t border-slate-100 pt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={() => window.print()}
            className="bg-[#0F766E] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0D6D65] transition-colors"
          >
            Print / Save as PDF
          </button>
          <Link href={`/learn/${params.courseId}`} className="border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
            Back to Course
          </Link>
        </div>
      </div>
    </div>
  );
}
