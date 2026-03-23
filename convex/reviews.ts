import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be 1-5");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Verify enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_learner_course", (q: any) => q.eq("learnerId", user._id).eq("courseId", args.courseId))
      .unique();
    if (!enrollment) throw new Error("You must be enrolled to leave a review");

    // Check for existing review
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_learner_course", (q: any) => q.eq("learnerId", user._id).eq("courseId", args.courseId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating, body: args.body });
      return existing._id;
    }

    return await ctx.db.insert("reviews", {
      enrollmentId: enrollment._id,
      learnerId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

export const getReviewsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .order("desc")
      .collect();

    const withNames = await Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.learnerId);
        return { ...r, learnerName: user?.name ?? "Student", learnerAvatarUrl: user?.avatarUrl };
      })
    );

    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    return { reviews: withNames, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length };
  },
});

export const getMyReview = query({
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
      .query("reviews")
      .withIndex("by_learner_course", (q: any) => q.eq("learnerId", user._id).eq("courseId", args.courseId))
      .unique();
  },
});
