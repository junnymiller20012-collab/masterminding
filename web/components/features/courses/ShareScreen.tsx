"use client";

import { useState } from "react";
import { CheckCircle, Copy, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Props {
  courseTitle: string;
  shareUrl: string;
}

export function ShareScreen({ courseTitle, shareUrl }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const instagramCaption = `🚀 My new course is LIVE!\n\n"${courseTitle}" — everything you need to level up.\n\nEnroll now 👇\n${shareUrl}`;

  const emailTemplate = `Subject: My new course is live — ${courseTitle}\n\nHey [First Name],\n\nI just launched something I've been working on for a while and I wanted you to be the first to know.\n\nIt's called "${courseTitle}" and it's everything I wish I had when I was starting out.\n\nHere's the link to enroll:\n${shareUrl}\n\nI'd love for you to check it out. Hit reply if you have any questions!\n\n[Your name]`;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-9 h-9 text-teal-600" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Your course is live! 🎉</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        Share your link and start getting enrollments. Every share is a potential sale.
      </p>

      {/* Share URL */}
      <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 px-4 py-3 mb-8">
        <span className="flex-1 text-sm text-slate-600 truncate text-left">{shareUrl}</span>
        <button
          onClick={() => copy("url", shareUrl)}
          className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 shrink-0"
        >
          <Copy className="w-4 h-4" />
          {copiedId === "url" ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
        <button
          onClick={() => copy("instagram", instagramCaption)}
          className="border border-slate-200 rounded-xl p-5 text-left hover:border-teal-400 hover:bg-teal-50 transition-colors group"
        >
          <div className="text-2xl mb-2">📸</div>
          <p className="font-semibold text-slate-800 text-sm">Copy Instagram caption</p>
          <p className="text-xs text-slate-500 mt-1">Ready-to-post caption with your link</p>
          {copiedId === "instagram" && (
            <p className="text-xs text-teal-600 mt-1 font-medium">Copied!</p>
          )}
        </button>

        <button
          onClick={() => copy("email", emailTemplate)}
          className="border border-slate-200 rounded-xl p-5 text-left hover:border-teal-400 hover:bg-teal-50 transition-colors group"
        >
          <div className="text-2xl mb-2">✉️</div>
          <p className="font-semibold text-slate-800 text-sm">Copy email template</p>
          <p className="text-xs text-slate-500 mt-1">Send to your existing audience</p>
          {copiedId === "email" && (
            <p className="text-xs text-teal-600 mt-1 font-medium">Copied!</p>
          )}
        </button>
      </div>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        Go to Dashboard
      </Link>
    </div>
  );
}
