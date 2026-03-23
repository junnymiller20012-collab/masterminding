"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { SalesPagePreview } from "./SalesPagePreview";
import { RefreshCw } from "lucide-react";

interface Props {
  courseId: Id<"courses">;
  initialHeadline: string;
  initialSubheadline: string;
  initialBody: string;
  courseTitle: string;
  outcomes?: string[];
  mentorName?: string;
  priceCents: number;
  mentorSlug: string;
  courseSlug: string;
}

export function SalesPageEditor({
  courseId,
  initialHeadline,
  initialSubheadline,
  initialBody,
  courseTitle,
  outcomes,
  mentorName,
  priceCents,
  mentorSlug,
  courseSlug,
}: Props) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [subheadline, setSubheadline] = useState(initialSubheadline);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSalesPage = useMutation(api.courses.updateSalesPage);

  function scheduleSave(h: string, s: string, b: string) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateSalesPage({ courseId, headline: h, subheadline: s, body: b });
      } finally {
        setSaving(false);
      }
    }, 1000);
  }

  function handleHeadline(v: string) { setHeadline(v); scheduleSave(v, subheadline, body); }
  function handleSubheadline(v: string) { setSubheadline(v); scheduleSave(headline, v, body); }
  function handleBody(v: string) { setBody(v); scheduleSave(headline, subheadline, v); }

  async function regenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/sales-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setHeadline(data.headline);
      setSubheadline(data.subheadline);
      setBody(data.body);
      await updateSalesPage({ courseId, headline: data.headline, subheadline: data.subheadline, body: data.body });
    } catch {
      setError("Failed to regenerate. Try again.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Edit Sales Page</h2>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-slate-400">Saving...</span>}
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
            Headline
          </label>
          <input
            value={headline}
            onChange={(e) => handleHeadline(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
            Subheadline
          </label>
          <input
            value={subheadline}
            onChange={(e) => handleSubheadline(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
            Body Copy
          </label>
          <textarea
            value={body}
            onChange={(e) => handleBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <a
            href={`/${mentorSlug}/${courseSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Preview as learner ↗
          </a>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Live Preview</p>
        <SalesPagePreview
          headline={headline}
          subheadline={subheadline}
          body={body}
          courseTitle={courseTitle}
          outcomes={outcomes}
          mentorName={mentorName}
          priceCents={priceCents}
        />
      </div>
    </div>
  );
}
