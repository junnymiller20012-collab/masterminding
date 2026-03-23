"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { SectionSidebar } from "./SectionSidebar";
import { VideoPlayer } from "./VideoPlayer";
import { CheckCircle } from "lucide-react";

interface Section {
  _id: Id<"sections">;
  title: string;
  order: number;
  lessons: Array<{
    title: string;
    videoUrl?: string;
    videoStorageId?: string;
    description?: string;
    isFree: boolean;
    order: number;
  }>;
}

interface Props {
  courseId: Id<"courses">;
  courseTitle: string;
  sections: Section[];
  completedSectionIds: string[];
}

export function CoursePlayer({ courseId, courseTitle, sections, completedSectionIds: initial }: Props) {
  const [currentSectionId, setCurrentSectionId] = useState<Id<"sections"> | null>(
    sections[0]?._id ?? null
  );
  const [completed, setCompleted] = useState<string[]>(initial);
  const [marking, setMarking] = useState(false);

  const markComplete = useMutation(api.progress.markSectionComplete);

  const currentSection = sections.find((s) => s._id === currentSectionId);
  const currentLesson = currentSection?.lessons[0];
  const currentIndex = sections.findIndex((s) => s._id === currentSectionId);
  const nextSection = sections[currentIndex + 1] ?? null;
  const isCompleted = currentSectionId ? completed.includes(currentSectionId) : false;

  async function handleMarkComplete() {
    if (!currentSectionId || isCompleted) return;
    setMarking(true);
    try {
      await markComplete({ courseId, sectionId: currentSectionId });
      setCompleted((prev) => [...prev, currentSectionId!]);
      if (nextSection) {
        setTimeout(() => setCurrentSectionId(nextSection._id), 500);
      }
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <SectionSidebar
        sections={sections}
        currentSectionId={currentSectionId}
        completedSectionIds={completed}
        onSelect={setCurrentSectionId}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{courseTitle}</p>
            <h1 className="text-2xl font-bold text-slate-900">{currentSection?.title}</h1>
          </div>

          {currentLesson?.videoUrl && <VideoPlayer url={currentLesson.videoUrl} />}

          {currentLesson?.description && (
            <div className="prose prose-slate max-w-none text-sm">
              <p>{currentLesson.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-teal-600 font-medium text-sm">
                <CheckCircle className="w-5 h-5" />
                Section complete
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="flex items-center gap-2 bg-[#0F766E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {marking ? "Saving..." : "Mark Complete"}
              </button>
            )}
            {nextSection && (
              <button
                onClick={() => setCurrentSectionId(nextSection._id)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Next: {nextSection.title} →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
