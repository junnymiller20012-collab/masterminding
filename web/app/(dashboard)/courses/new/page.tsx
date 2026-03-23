"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CourseDetailsForm, CourseDetailsValues } from "@/components/features/courses/CourseDetailsForm";
import { SectionManager, SectionDraft } from "@/components/features/courses/SectionManager";
import { PricingStep } from "@/components/features/courses/PricingStep";

const STEPS = ["Course Details", "Add Content", "Pricing"];

export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<CourseDetailsValues | null>(null);
  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const mentor = useQuery(api.mentors.getMe);
  const createCourse = useMutation(api.courses.create);
  const createSection = useMutation(api.sections.create);
  const updateSalesPage = useMutation(api.courses.updateSalesPage);

  async function handlePricingSubmit(priceCents: number) {
    if (!details) return;
    setIsGenerating(true);
    try {
      // Create course
      const courseId = await createCourse({
        title: details.title,
        description: details.description,
        targetAudience: details.targetAudience,
        outcomes: details.outcomes.map((o) => o.value),
        priceCents,
        currency: "usd",
        shortDescription: details.description.slice(0, 120),
      });

      // Create sections
      for (const section of sections) {
        await createSection({
          courseId,
          title: section.title,
          videoUrl: section.type === "video_url" ? section.videoUrl : undefined,
          isFree: false,
        });
      }

      // Generate sales page
      const res = await fetch("/api/generate/sales-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const { headline, subheadline, body } = await res.json();
        await updateSalesPage({ courseId, headline, subheadline, body });
      }

      router.push(`/courses/${courseId}/sales-page`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < step
                  ? "bg-teal-600 text-white"
                  : i === step
                  ? "bg-[#0F766E] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                i === step ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {step === 0 && "Tell us about your course"}
          {step === 1 && "Add your course content"}
          {step === 2 && "Set your price"}
        </h1>

        {step === 0 && (
          <CourseDetailsForm
            onNext={(values) => { setDetails(values); setStep(1); }}
            defaultValues={details ?? undefined}
          />
        )}

        {step === 1 && (
          <SectionManager
            sections={sections}
            onChange={setSections}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            courseTitle={details?.title}
            courseDescription={details?.description}
            targetAudience={details?.targetAudience}
          />
        )}

        {step === 2 && (
          <PricingStep
            expertise={mentor?.expertise}
            onSubmit={handlePricingSubmit}
            onBack={() => setStep(1)}
            isLoading={isGenerating}
          />
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4" />
          <p className="text-lg font-semibold text-slate-800">Generating your sales page...</p>
          <p className="text-sm text-slate-500 mt-1">This takes about 10 seconds</p>
        </div>
      )}
    </div>
  );
}
