import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <nav className="border-b border-slate-100 dark:border-slate-800 px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">MasterMinding</span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-8xl font-bold text-slate-100 dark:text-slate-800 mb-4">404</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="bg-[#0F766E] hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Go home
          </Link>
          <Link
            href="/contact"
            className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
