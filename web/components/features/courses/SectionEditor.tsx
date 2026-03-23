"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { SectionDraft } from "./SectionManager";

interface Props {
  section: SectionDraft;
  index: number;
  onChange: (data: Partial<SectionDraft>) => void;
  onRemove: () => void;
}

export function SectionEditor({ section, index, onChange, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-slate-200 rounded-lg p-4 bg-white space-y-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Section {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input
        value={section.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Section title"
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ type: "video_url" })}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            section.type === "video_url"
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          Video URL
        </button>
        <button
          type="button"
          onClick={() => onChange({ type: "text" })}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            section.type === "text"
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          Text / Notes
        </button>
      </div>

      {section.type === "video_url" && (
        <input
          value={section.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="YouTube or Vimeo URL"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      )}

      {section.type === "text" && (
        <textarea
          value={section.textContent}
          onChange={(e) => onChange({ textContent: e.target.value })}
          rows={4}
          placeholder="Write your lesson content here..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
      )}
    </div>
  );
}
