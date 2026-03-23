"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, Sparkles } from "lucide-react";
import { SectionEditor } from "./SectionEditor";

export interface SectionDraft {
  id: string;
  title: string;
  videoUrl: string;
  type: "video_url" | "text";
  textContent: string;
}

interface Props {
  sections: SectionDraft[];
  onChange: (sections: SectionDraft[]) => void;
  onNext: () => void;
  onBack: () => void;
  courseTitle?: string;
  courseDescription?: string;
  targetAudience?: string;
}

export function SectionManager({ sections, onChange, onNext, onBack, courseTitle, courseDescription, targetAudience }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function addSection() {
    onChange([
      ...sections,
      { id: crypto.randomUUID(), title: "", videoUrl: "", type: "video_url", textContent: "" },
    ]);
  }

  function updateSection(id: string, data: Partial<SectionDraft>) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }

  function removeSection(id: string) {
    onChange(sections.filter((s) => s.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onChange(arrayMove(sections, oldIndex, newIndex));
    }
  }

  async function handleGenerate() {
    if (!courseTitle) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch("/api/generate/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: courseTitle, description: courseDescription, targetAudience }),
      });
      if (res.status === 429) {
        setGenerateError("You've used all 5 curriculum generations for this hour. Try again later.");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? "Generation failed. Try again.");
        return;
      }
      const generated = data.sections;
      if (!generated || generated.length === 0) {
        setGenerateError("No sections returned. Try again.");
        return;
      }
      onChange(
        generated.map((s: { title: string; textContent: string }) => ({
          id: crypto.randomUUID(),
          title: s.title,
          videoUrl: "",
          type: "text" as const,
          textContent: s.textContent,
        }))
      );
    } catch (err) {
      setGenerateError("Generation failed. Try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const canContinue = sections.length > 0 && sections.every((s) => s.title.trim().length > 0);

  return (
    <div className="space-y-4">

      {/* AI Generate Curriculum */}
      {courseTitle && (
        <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">AI Curriculum Generator</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
              Generate 5–7 sections based on your course · 5 uses/hour
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating..." : "Generate Curriculum"}
          </button>
        </div>
      )}
      {generateError && <p className="text-xs text-red-500">{generateError}</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              onChange={(data) => updateSection(section.id, data)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addSection}
        className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add section
      </button>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 bg-[#0F766E] text-white py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Pricing →
        </button>
      </div>
    </div>
  );
}
