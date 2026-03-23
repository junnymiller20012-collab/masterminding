import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { BookOpen, Users, Star } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ mentorSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mentorSlug } = await params;
  const data = await fetchQuery(api.mentors.getBySlug, { slug: mentorSlug });
  if (!data) return { title: "Mentor Not Found" };
  const { mentor } = data;
  return {
    title: mentor.name,
    description: mentor.bio?.slice(0, 160) ?? `Courses by ${mentor.name} — ${mentor.expertise}`,
    openGraph: {
      title: `${mentor.name} — ${mentor.expertise}`,
      description: mentor.bio?.slice(0, 160) ?? `Courses by ${mentor.name}`,
      ...(mentor.avatarUrl ? { images: [{ url: mentor.avatarUrl }] } : {}),
    },
  };
}

export default async function MentorStorefrontPage({ params }: Props) {
  const { mentorSlug } = await params;
  const data = await fetchQuery(api.mentors.getBySlug, { slug: mentorSlug });

  if (!data) notFound();

  const { mentor, courses } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-white/20 overflow-hidden shrink-0 flex items-center justify-center">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{mentor.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{mentor.name}</h1>
            <p className="text-teal-200 mt-1 text-lg">{mentor.expertise}</p>
            <p className="text-white/80 mt-3 leading-relaxed max-w-xl">{mentor.bio}</p>
            <div className="flex items-center gap-5 mt-4 text-sm text-teal-100">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {courses.reduce((s, c) => s + c.enrollmentCount, 0)} students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Courses by {mentor.name}</h2>

        {courses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No courses published yet</p>
            <p className="text-sm text-slate-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/${mentorSlug}/${course.slug}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-10 h-10 text-white/60" />
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {course.shortDescription || course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {course.enrollmentCount} students
                    </span>
                    <span className="text-lg font-bold text-teal-700">
                      ${(course.priceCents / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
