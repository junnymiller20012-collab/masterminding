import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { CourseSalesPage } from "@/components/features/storefront/CourseSalesPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ mentorSlug: string; courseSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mentorSlug, courseSlug } = await params;
  const data = await fetchQuery(api.courses.getByMentorSlugAndCourseSlug, {
    mentorSlug,
    courseSlug,
  });
  if (!data) return { title: "Course Not Found" };
  return {
    title: data.course.salesPageHeadline ?? data.course.title,
    description: data.course.salesPageSubheadline ?? data.course.description.slice(0, 160),
    openGraph: {
      title: data.course.salesPageHeadline ?? data.course.title,
      description: data.course.salesPageSubheadline ?? data.course.description.slice(0, 160),
    },
  };
}

export default async function CoursePublicPage({ params }: Props) {
  const { mentorSlug, courseSlug } = await params;
  const data = await fetchQuery(api.courses.getByMentorSlugAndCourseSlug, {
    mentorSlug,
    courseSlug,
  });

  if (!data) notFound();

  return (
    <CourseSalesPage
      course={data.course}
      mentor={data.mentor}
      sections={data.sections}
      otherCourses={data.otherCourses}
      mentorSlug={mentorSlug}
    />
  );
}
