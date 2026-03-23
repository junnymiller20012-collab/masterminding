"use client";

import { CheckCircle } from "lucide-react";

interface Props {
  headline: string;
  subheadline: string;
  body: string;
  courseTitle: string;
  outcomes?: string[];
  mentorName?: string;
  priceCents: number;
}

export function SalesPagePreview({
  headline,
  subheadline,
  body,
  courseTitle,
  outcomes = [],
  mentorName,
  priceCents,
}: Props) {
  const price = (priceCents / 100).toFixed(2);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-8">
        <h1 className="text-xl font-bold leading-tight mb-2">
          {headline || <span className="opacity-30">Your headline will appear here</span>}
        </h1>
        <p className="text-slate-300 text-sm">
          {subheadline || <span className="opacity-30">Your subheadline will appear here</span>}
        </p>
        <div className="mt-6">
          <button className="bg-[#0F766E] text-white px-5 py-2.5 rounded-lg font-semibold text-sm">
            Enroll Now — ${price}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-4">
        {body ? (
          body.split("\n\n").map((para, i) => (
            <p key={i} className="text-slate-600 leading-relaxed">
              {para}
            </p>
          ))
        ) : (
          <p className="text-slate-300">Your sales copy will appear here...</p>
        )}

        {outcomes.length > 0 && (
          <div className="pt-2">
            <p className="font-semibold text-slate-800 mb-3">What you'll learn</p>
            <ul className="space-y-2">
              {outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mentorName && (
          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
            Taught by <span className="font-medium text-slate-600">{mentorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
