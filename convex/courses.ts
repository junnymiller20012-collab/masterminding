import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

// Create a new draft course
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    outcomes: v.optional(v.array(v.string())),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mentor = await getAuthenticatedMentor(ctx);
    const now = Date.now();
    const baseSlug = slugify(args.title);

    // Ensure slug uniqueness within mentor's courses
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_slug", (q: any) => q.eq("slug", slug))
        .unique();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    return await ctx.db.insert("courses", {
      mentorId: mentor._id,
      title: args.title,
      slug,
      description: args.description,
      shortDescription: args.shortDescription ?? "",
      targetAudience: args.targetAudience,
      outcomes: args.outcomes,
      priceCents: args.priceCents ?? 0,
      currency: args.currency ?? "usd",
      status: "draft",
      enrollmentCount: 0,
      totalRevenueCents: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update course fields
export const update = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    outcomes: v.optional(v.array(v.string())),
    priceCents: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mentor = await getAuthenticatedMentor(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.mentorId !== mentor._id) throw new Error("Unauthorized");

    const { courseId, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) updates[k] = v;
    }
    await ctx.db.patch(args.courseId, updates);
  },
});

// Update the AI-generated sales page content
export const updateSalesPage = mutation({
  args: {
    courseId: v.id("courses"),
    headline: v.string(),
    subheadline: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const mentor = await getAuthenticatedMentor(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.mentorId !== mentor._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.courseId, {
      salesPageHeadline: args.headline,
      salesPageSubheadline: args.subheadline,
      salesPageBody: args.body,
      salesPageGenerated: true,
      updatedAt: Date.now(),
    });
  },
});

// Publish a course (must have sections and sales page)
export const publish = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const mentor = await getAuthenticatedMentor(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.mentorId !== mentor._id) throw new Error("Unauthorized");

    // TODO: re-enable before launch
    // if (
    //   mentor.subscriptionStatus !== "active" &&
    //   mentor.subscriptionStatus !== "trialing"
    // ) {
    //   throw new Error("An active subscription is required to publish courses");
    // }

    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();
    if (sections.length === 0) throw new Error("Add at least one section before publishing");
    if (!course.salesPageGenerated) throw new Error("Generate your sales page before publishing");

    await ctx.db.patch(args.courseId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a draft course
export const remove = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const mentor = await getAuthenticatedMentor(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.mentorId !== mentor._id) throw new Error("Unauthorized");

    // Delete all sections first
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();
    for (const section of sections) {
      await ctx.db.delete(section._id);
    }

    await ctx.db.delete(args.courseId);
  },
});

// Get a course by ID (public)
export const getById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Get a published course by mentor slug + course slug (public)
export const getByMentorSlugAndCourseSlug = query({
  args: { mentorSlug: v.string(), courseSlug: v.string() },
  handler: async (ctx, args) => {
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.mentorSlug))
      .unique();
    if (!mentor) return null;

    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.courseSlug))
      .unique();
    if (!course || course.mentorId !== mentor._id) return null;
    if (course.status !== "published") return null;

    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", course._id))
      .collect();

    const allMentorCourses = await ctx.db
      .query("courses")
      .withIndex("by_mentor_id_status", (q: any) =>
        q.eq("mentorId", mentor._id).eq("status", "published")
      )
      .collect();
    const otherCourses = allMentorCourses.filter((c) => c._id !== course._id);

    return {
      course,
      mentor,
      sections: sections.sort((a, b) => a.order - b.order),
      otherCourses,
    };
  },
});

// Analytics for a single course
export const getAnalytics = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();

    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();

    const progressRecords = await Promise.all(
      enrollments.map(async (e) => {
        const progress = await ctx.db
          .query("progress")
          .withIndex("by_learner_course", (q: any) =>
            q.eq("learnerId", e.learnerId).eq("courseId", args.courseId)
          )
          .unique();
        const learner = await ctx.db.get(e.learnerId);
        const completedCount = progress?.completedLessons.length ?? 0;
        return {
          learnerId: e.learnerId,
          learnerName: learner?.name ?? "Unknown",
          learnerEmail: learner?.email ?? "",
          enrolledAt: e.enrolledAt,
          amountPaidCents: e.amountPaidCents,
          completedSections: completedCount,
          totalSections: sections.length,
          progressPct: sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0,
        };
      })
    );

    const completionRate = progressRecords.length > 0
      ? Math.round(progressRecords.filter((p) => p.progressPct === 100).length / progressRecords.length * 100)
      : 0;

    return {
      course,
      enrollmentCount: enrollments.length,
      totalRevenueCents: enrollments.reduce((sum, e) => sum + e.amountPaidCents, 0),
      completionRate,
      students: progressRecords,
    };
  },
});

// List authenticated mentor's courses
export const listByMentor = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) return [];

    return await ctx.db
      .query("courses")
      .withIndex("by_mentor_id", (q: any) => q.eq("mentorId", mentor._id))
      .collect();
  },
});

export const listPublished = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("newest"), v.literal("popular"), v.literal("price_asc"), v.literal("price_desc"))),
  },
  handler: async (ctx, args) => {
    let courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    if (args.search) {
      const s = args.search.toLowerCase();
      courses = courses.filter(
        (c) => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)
      );
    }

    const withMentors = await Promise.all(
      courses.map(async (c) => {
        const mentor = await ctx.db.get(c.mentorId);
        return { ...c, mentorName: mentor?.name ?? "", mentorSlug: mentor?.slug ?? "", mentorAvatarUrl: mentor?.avatarUrl };
      })
    );

    const sorted = withMentors.sort((a, b) => {
      if (args.sortBy === "popular") return b.enrollmentCount - a.enrollmentCount;
      if (args.sortBy === "price_asc") return a.priceCents - b.priceCents;
      if (args.sortBy === "price_desc") return b.priceCents - a.priceCents;
      return b.createdAt - a.createdAt; // newest
    });

    return sorted.slice(0, 48);
  },
});
