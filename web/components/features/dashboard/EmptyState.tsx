import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ name }: { name?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-[#0F766E]" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Welcome{name ? `, ${name}` : ""}! 👋
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        You're all set up. Create your first course and get your sales page live
        in under 30 minutes.
      </p>
      <Link href="/dashboard/courses/new">
        <Button>Create your first course</Button>
      </Link>
    </div>
  );
}
