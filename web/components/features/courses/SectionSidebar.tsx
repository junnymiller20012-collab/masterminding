"use client";

import { CheckCircle, Circle } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

interface Section {
  _id: Id<"sections">;
  title: string;
  order: number;
}

interface Props {
  sections: Section[];
  currentSectionId: Id<"sections"> | null;
  completedSectionIds: string[];
  onSelect: (sectionId: Id<"sections">) => void;
}

export function SectionSidebar({ sections, currentSectionId, completedSectionIds, onSelect }: Props) {
  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Course Content</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {completedSectionIds.length} / {sections.length} completed
        </p>
      </div>
      <ul className="py-2">
        {sections.map((section, i) => {
          const isCompleted = completedSectionIds.includes(section._id);
          const isCurrent = currentSectionId === section._id;
          return (
            <li key={section._id}>
              <button
                onClick={() => onSelect(section._id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  isCurrent
                    ? "bg-teal-50 border-r-2 border-teal-600"
                    : "hover:bg-slate-50"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                )}
                <span className={`text-sm ${isCurrent ? "text-teal-700 font-medium" : "text-slate-700"}`}>
                  {i + 1}. {section.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
