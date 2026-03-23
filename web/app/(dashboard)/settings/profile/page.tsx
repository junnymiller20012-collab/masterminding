"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Save, User, ExternalLink } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  expertise: z.string().min(5, "Expertise must be at least 5 characters"),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const inputClass = "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400";

export default function SettingsProfilePage() {
  const mentor = useQuery(api.mentors.getMe);
  const updateProfile = useMutation(api.mentors.updateProfile);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (mentor && !initialized) {
      reset({
        name: mentor.name,
        bio: mentor.bio,
        expertise: mentor.expertise,
        avatarUrl: mentor.avatarUrl ?? "",
      });
      setInitialized(true);
    }
  }, [mentor, initialized, reset]);

  async function onSubmit(values: FormValues) {
    await updateProfile({
      name: values.name,
      bio: values.bio,
      expertise: values.expertise,
      avatarUrl: values.avatarUrl || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    reset(values);
  }

  if (mentor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (mentor === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No mentor profile found. Please complete <a href="/onboarding/profile" className="text-teal-600 underline">onboarding</a> first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your public profile is visible at{" "}
          <a href={`/${mentor.slug}`} target="_blank" className="text-teal-600 hover:underline inline-flex items-center gap-1">
            /{mentor.slug}
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center overflow-hidden shrink-0">
              {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Avatar URL</label>
              <input {...register("avatarUrl")} placeholder="https://..." className={inputClass} />
              {errors.avatarUrl && <p className="text-xs text-red-500 mt-1">{errors.avatarUrl.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name</label>
            <input {...register("name")} className={inputClass} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Expertise / Tagline</label>
            <input {...register("expertise")} placeholder="e.g. Digital Marketing Expert & Course Creator" className={inputClass} />
            {errors.expertise && <p className="text-xs text-red-500 mt-1">{errors.expertise.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Bio</label>
            <textarea {...register("bio")} rows={4} placeholder="Tell students about yourself..." className={`${inputClass} resize-none`} />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Your Public URL</label>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <span className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-400 border-r border-slate-200 dark:border-slate-700">
                masterminding.com/
              </span>
              <span className="px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium">{mentor.slug}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Your URL cannot be changed after creation.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isDirty}
          className="w-full flex items-center justify-center gap-2 bg-[#0F766E] text-white py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
