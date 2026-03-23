import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const lessonSchema = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  videoStorageId: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  durationSeconds: v.optional(v.number()),
  order: v.number(),
  isFree: v.boolean(),
});

async function getAuthenticatedMentor(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const mentor = await ctx.db
    .query("mentors")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!mentor) throw new Error("Mentor profile not found");
  return mentor;
}

async function verifyCourseOwnership(ctx: any, courseId: any) {
  const mentor = await getAuthenticatedMentor(ctx);
  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");
  if (course.mentorId !== mentor._id) throw new Error("Unauthorized");
  return { mentor, course };
}

// Create a new section in a course
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyCourseOwnership(ctx, args.courseId);

    const existing = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();

    const order = existing.length;
    const now = Date.now();

    return await ctx.db.insert("sections", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      order,
      lessons: [
        {
          title: args.title,
          description: args.description,
          videoUrl: args.videoUrl,
          videoStorageId: args.videoStorageId,
          order: 0,
          isFree: args.isFree ?? false,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a section's fields
export const update = mutation({
  args: {
    sectionId: v.id("sections"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) throw new Error("Section not found");
    await verifyCourseOwnership(ctx, section.courseId);

    const { sectionId, title, description, videoUrl, videoStorageId, isFree } = args;

    const updatedLesson = {
      ...section.lessons[0],
      title: title ?? section.lessons[0].title,
      description: description ?? section.lessons[0].description,
      videoUrl: videoUrl ?? section.lessons[0].videoUrl,
      videoStorageId: videoStorageId ?? section.lessons[0].videoStorageId,
      isFree: isFree ?? section.lessons[0].isFree,
    };

    await ctx.db.patch(sectionId, {
      title: title ?? section.title,
      description: description ?? section.description,
      lessons: [updatedLesson],
      updatedAt: Date.now(),
    });
  },
});

// Delete a section
export const remove = mutation({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) throw new Error("Section not found");
    await verifyCourseOwnership(ctx, section.courseId);
    await ctx.db.delete(args.sectionId);

    // Re-number remaining sections
    const remaining = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", section.courseId))
      .collect();
    const sorted = remaining.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      await ctx.db.patch(sorted[i]._id, { order: i });
    }
  },
});

// Reorder sections by providing an ordered array of section IDs
export const reorder = mutation({
  args: {
    courseId: v.id("courses"),
    sectionIds: v.array(v.id("sections")),
  },
  handler: async (ctx, args) => {
    await verifyCourseOwnership(ctx, args.courseId);
    for (let i = 0; i < args.sectionIds.length; i++) {
      await ctx.db.patch(args.sectionIds[i], { order: i, updatedAt: Date.now() });
    }
  },
});

// Public query — list sections for a course ordered by position
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();
    return sections.sort((a, b) => a.order - b.order);
  },
});
