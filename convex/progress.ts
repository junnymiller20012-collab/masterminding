import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

// Mark a section as complete
export const markSectionComplete = mutation({
  args: {
    courseId: v.id("courses"),
    sectionId: v.id("sections"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Verify enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", user._id).eq("courseId", args.courseId)
      )
      .unique();
    if (!enrollment) throw new Error("Not enrolled");

    const key = args.sectionId;
    const now = Date.now();

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    if (existing) {
      const completedLessons = existing.completedLessons.includes(key)
        ? existing.completedLessons
        : [...existing.completedLessons, key];
      await ctx.db.patch(existing._id, {
        completedLessons,
        lastAccessedAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("progress", {
        enrollmentId: enrollment._id,
        learnerId: user._id,
        courseId: args.courseId,
        completedLessons: [key],
        lastAccessedAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get progress for a learner in a course
export const getProgressByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("progress")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", user._id).eq("courseId", args.courseId)
      )
      .unique();
  },
});
