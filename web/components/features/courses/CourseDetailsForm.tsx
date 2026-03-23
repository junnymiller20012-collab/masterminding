"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  targetAudience: z.string().min(10, "Describe your target audience"),
  outcomes: z
    .array(z.object({ value: z.string().min(5, "Each outcome must be at least 5 characters") }))
    .min(3, "Add at least 3 learning outcomes"),
});

export type CourseDetailsValues = z.infer<typeof schema>;

interface Props {
  onNext: (values: CourseDetailsValues) => void;
  defaultValues?: Partial<CourseDetailsValues>;
}

export function CourseDetailsForm({ onNext, defaultValues }: Props) {
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      targetAudience: defaultValues?.targetAudience ?? "",
      outcomes: defaultValues?.outcomes ?? [{ value: "" }, { value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "outcomes" });
  const description = watch("description");
  const title = watch("title");
  const targetAudience = watch("targetAudience");

  async function handleEnhance() {
    if (!title && !description) return;
    setEnhancing(true);
    setEnhanceError("");
    try {
      const res = await fetch("/api/enhance/course-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, targetAudience }),
      });
      if (res.status === 429) {
        setEnhanceError("You've used all 5 AI enhancements for this hour. Try again later.");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.title) setValue("title", data.title, { shouldValidate: true });
        if (data.description) setValue("description", data.description, { shouldValidate: true });
      }
    } catch {
      setEnhanceError("Enhancement failed. Try again.");
    } finally {
      setEnhancing(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">

      {/* AI Enhance Button */}
      <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg">
        <div>
          <p className="text-sm font-medium text-teal-800 dark:text-teal-300">AI Enhancement</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
            Polish your title & description with AI · 5 uses/hour
          </p>
        </div>
        <button
          type="button"
          onClick={handleEnhance}
          disabled={enhancing || (!title && !description)}
          className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-4 h-4 ${enhancing ? "animate-pulse" : ""}`} />
          {enhancing ? "Enhancing..." : "Enhance with AI"}
        </button>
      </div>
      {enhanceError && <p className="text-xs text-red-500 -mt-4">{enhanceError}</p>}

      {/* Title */}
      <div>
        <label className={labelClass}>
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Instagram Growth for Service Businesses"
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Course Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Describe what your course covers in detail..."
          className={`${inputClass} resize-none`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${description.length < 100 ? "text-slate-400" : "text-teal-600"}`}>
            {description.length} / 100 min
          </span>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label className={labelClass}>
          Who is this for? <span className="text-red-500">*</span>
        </label>
        <input
          {...register("targetAudience")}
          placeholder="e.g. Freelancers and consultants who want to grow their client base"
          className={inputClass}
        />
        {errors.targetAudience && (
          <p className="mt-1 text-xs text-red-500">{errors.targetAudience.message}</p>
        )}
      </div>

      {/* Learning Outcomes */}
      <div>
        <label className={labelClass}>
          Learning Outcomes <span className="text-red-500">*</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(min 3)</span>
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`outcomes.${index}.value`)}
                placeholder={`Outcome ${index + 1}`}
                className={inputClass}
              />
              {fields.length > 3 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.outcomes && (
          <p className="mt-1 text-xs text-red-500">
            {errors.outcomes.message ?? errors.outcomes.root?.message}
          </p>
        )}
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="mt-2 flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add outcome
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors"
      >
        Continue to Content →
      </button>
    </form>
  );
}
