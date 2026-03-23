"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(3, "Required"),
});

type FormData = z.infer<typeof schema>;

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export function ProfileStep() {
  const { user } = useUser();
  const router = useRouter();
  const createProfile = useMutation(api.mentors.createProfile);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.fullName ?? "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, setValue]);

  async function onSubmit(data: FormData) {
    try {
      await createProfile({
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        expertise: data.expertise,
        avatarUrl: user?.imageUrl,
      });
      router.push("/onboarding/subscribe");
    } catch (err: any) {
      alert(err.message ?? "Something went wrong");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                step === 1
                  ? "bg-[#0F766E] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400",
              ].join(" ")}
            >
              {step}
            </div>
            {step < 3 && <div className="w-12 h-px bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        Set up your mentor profile
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
        This is what learners see when they visit your storefront.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Your name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="e.g. Junny Miller"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your URL
          </label>
          <div className="flex items-center gap-0">
            <span className="h-10 px-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg text-sm text-slate-500 dark:text-slate-400 flex items-center">
              masterminding.app/
            </span>
            <input
              {...register("slug")}
              className="flex-1 h-10 px-3 rounded-r-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              placeholder="your-name"
            />
          </div>
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your bio
          </label>
          <textarea
            {...register("bio")}
            rows={4}
            placeholder="Tell learners about yourself, your experience, and what you teach..."
            className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          />
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <Input
          label="Your area of expertise"
          {...register("expertise")}
          error={errors.expertise?.message}
          placeholder="e.g. Digital Marketing, Business Coaching, Fitness"
        />

        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          Continue →
        </Button>
      </form>
    </div>
  );
}
