import { CheckCircle, BookOpen } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { EnrollButton } from "./EnrollButton";
import { ReviewSection } from "./ReviewSection";
import Link from "next/link";

interface Course {
  _id: Id<"courses">;
  title: string;
  description: string;
  shortDescription?: string;
  targetAudience?: string;
  outcomes?: string[];
  priceCents: number;
  coverImageUrl?: string;
  salesPageHeadline?: string;
  salesPageSubheadline?: string;
  salesPageBody?: string;
  enrollmentCount: number;
  slug: string;
}

interface Mentor {
  name: string;
  bio: string;
  expertise?: string;
  avatarUrl?: string;
  slug: string;
}

interface Section {
  _id: Id<"sections">;
  title: string;
  order: number;
}

interface Props {
  course: Course;
  mentor: Mentor;
  sections: Section[];
  otherCourses?: Course[];
  mentorSlug: string;
}

export function CourseSalesPage({ course, mentor, sections, otherCourses = [], mentorSlug }: Props) {
  const price = (course.priceCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold leading-tight mb-4 !text-white">
            {course.salesPageHeadline ?? course.title}
          </h1>
          {course.salesPageSubheadline && (
            <p className="text-xl text-slate-300 mb-8">{course.salesPageSubheadline}</p>
          )}
          <div className="flex items-center gap-4">
            <EnrollButton courseId={course._id} priceCents={course.priceCents} />
          </div>
          {course.enrollmentCount > 0 && (
            <p className="text-slate-400 text-sm mt-3">
              {course.enrollmentCount} students enrolled
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* Sales copy */}
        {course.salesPageBody && (
          <div className="space-y-4">
            {course.salesPageBody.split("\n\n").map((para, i) => (
              <p key={i} className="text-slate-600 text-lg leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Outcomes */}
        {course.outcomes && course.outcomes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you'll learn</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Curriculum */}
        {sections.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Course Content</h2>
              <span className="text-sm text-slate-500">{sections.length} {sections.length === 1 ? "lesson" : "lessons"}</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {sections.map((section, i) => (
                <div key={section._id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700">{section.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructor */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Instructor</h2>
          <div className="border border-slate-200 rounded-xl p-6 flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-teal-100 flex items-center justify-center">
              {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-teal-700">{mentor.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">{mentor.name}</p>
              {mentor.expertise && (
                <p className="text-teal-600 text-sm font-medium mb-2">{mentor.expertise}</p>
              )}
              <p className="text-slate-600 text-sm leading-relaxed">{mentor.bio}</p>
            </div>
          </div>
        </div>

        {/* More courses */}
        {otherCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">More from {mentor.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCourses.map((c) => (
                <Link
                  key={c._id}
                  href={`/${mentorSlug}/${c.slug}`}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-28 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                    {c.coverImageUrl ? (
                      <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-white/60" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors leading-tight mb-1">
                      {c.title}
                    </p>
                    <p className="text-teal-700 font-bold text-sm">${(c.priceCents / 100).toFixed(0)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection courseId={course._id} />

        {/* CTA */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to get started?</h2>
          <p className="text-slate-500 mb-6">Join today and get lifetime access.</p>
          <div className="max-w-xs mx-auto">
            <EnrollButton courseId={course._id} priceCents={course.priceCents} />
          </div>
        </div>
      </div>
    </div>
  );
}
