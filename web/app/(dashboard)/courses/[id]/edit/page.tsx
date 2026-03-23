"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { SectionManager, SectionDraft } from "@/components/features/courses/SectionManager";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Eye, RotateCcw, Sparkles, Globe } from "lucide-react";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(100),
  targetAudience: z.string().min(10),
  priceCents: z.number().min(100),
});

type FormValues = z.infer<typeof schema>;

interface Props { params: Promise<{ id: string }> }

export default function EditCoursePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const course = useQuery(api.courses.getById, { courseId: id as Id<"courses"> });
  const existingSections = useQuery(api.sections.listByCourse, { courseId: id as Id<"courses"> });
  const mentor = useQuery(api.mentors.getMe);

  const updateCourse = useMutation(api.courses.update);
  const publishCourse = useMutation(api.courses.publish);
  const createSection = useMutation(api.sections.create);
  const updateSection = useMutation(api.sections.update);
  const removeSection = useMutation(api.sections.remove);
  const reorderSections = useMutation(api.sections.reorder);
  const updateSalesPage = useMutation(api.courses.updateSalesPage);

  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function handleEnhance() {
    const title = watch("title");
    const description = watch("description");
    const targetAudience = watch("targetAudience");
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

  useEffect(() => {
    if (course && existingSections && !initialized) {
      reset({
        title: course.title,
        description: course.description,
        targetAudience: course.targetAudience ?? "",
        priceCents: course.priceCents,
      });
      setSections(existingSections.map((s) => ({
        id: s._id,
        title: s.title,
        videoUrl: s.lessons[0]?.videoUrl ?? "",
        type: s.lessons[0]?.videoUrl ? "video_url" : "text",
        textContent: s.lessons[0]?.description ?? "",
      })));
      setInitialized(true);
    }
  }, [course, existingSections, initialized, reset]);

  async function onSave(values: FormValues) {
    setSaving(true);
    try {
      await updateCourse({
        courseId: id as Id<"courses">,
        title: values.title,
        description: values.description,
        targetAudience: values.targetAudience,
        priceCents: values.priceCents,
      });

      // Sync sections
      const existingIds = (existingSections ?? []).map((s) => s._id);
      const newIds = sections.filter((s) => existingIds.includes(s.id as any)).map((s) => s.id as Id<"sections">);

      for (const s of sections) {
        if (existingIds.includes(s.id as any)) {
          await updateSection({
            sectionId: s.id as Id<"sections">,
            title: s.title,
            videoUrl: s.type === "video_url" ? s.videoUrl : undefined,
            description: s.type === "text" ? s.textContent : undefined,
          });
        } else {
          await createSection({
            courseId: id as Id<"courses">,
            title: s.title,
            videoUrl: s.type === "video_url" ? s.videoUrl : undefined,
          });
        }
      }

      // Delete removed sections
      for (const existing of existingSections ?? []) {
        if (!sections.find((s) => s.id === existing._id)) {
          await removeSection({ sectionId: existing._id });
        }
      }

      if (newIds.length > 0) {
        await reorderSections({ courseId: id as Id<"courses">, sectionIds: newIds });
      }

      router.push("/courses");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/generate/sales-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      if (res.ok) {
        const { headline, subheadline, body } = await res.json();
        await updateSalesPage({ courseId: id as Id<"courses">, headline, subheadline, body });
        alert("Sales page regenerated!");
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handlePublish() {
    if (!confirm("Publish this course? It will be live and visible to students.")) return;
    setPublishing(true);
    try {
      await publishCourse({ courseId: id as Id<"courses"> });
      router.push("/courses");
    } catch (err: any) {
      alert(err.message ?? "Failed to publish. Make sure you have at least one section and a generated sales page.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!confirm("Unpublish this course? It will no longer be visible to learners.")) return;
    await updateCourse({ courseId: id as Id<"courses"> });
    router.push("/courses");
  }

  if (!course || !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Course</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
            Regenerate Sales Page
          </button>
          {course.status === "published" && (
            <a
              href={`/${mentor?.slug}/${course.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <Eye className="w-4 h-4" />
              View Live
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">Course Details</h2>
            <button
              type="button"
              onClick={handleEnhance}
              disabled={enhancing}
              className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${enhancing ? "animate-pulse" : ""}`} />
              {enhancing ? "Enhancing..." : "Enhance with AI"}
            </button>
          </div>
          {enhanceError && <p className="text-xs text-red-500">{enhanceError}</p>}

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Title</label>
            <input {...register("title")} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Description</label>
            <textarea {...register("description")} rows={5} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Who is this for?</label>
            <input {...register("targetAudience")} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Price (cents)</label>
            <input type="number" {...register("priceCents", { valueAsNumber: true })} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Sections</h2>
          <SectionManager
            sections={sections}
            onChange={setSections}
            onNext={() => {}}
            onBack={() => {}}
            courseTitle={course.title}
            courseDescription={course.description}
            targetAudience={course.targetAudience}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {course.status === "draft" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0F766E] text-white py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-50"
            >
              <Globe className="w-4 h-4" />
              {publishing ? "Publishing..." : "Publish Course"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
