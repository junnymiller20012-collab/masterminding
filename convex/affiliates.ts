import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const generateAffiliateLink = mutation({
  args: { courseId: v.id("courses"), commissionPercent: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Check if already has a link for this course
    const existing = await ctx.db
      .query("affiliates")
      .withIndex("by_affiliate_user", (q: any) => q.eq("affiliateUserId", user._id))
      .filter((q: any) => q.eq(q.field("courseId"), args.courseId))
      .unique();
    if (existing) return existing.referralCode;

    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const referralCode = generateCode();
    await ctx.db.insert("affiliates", {
      mentorId: course.mentorId,
      courseId: args.courseId,
      affiliateUserId: user._id,
      referralCode,
      commissionPercent: args.commissionPercent ?? 20,
      totalReferrals: 0,
      totalEarnedCents: 0,
      createdAt: Date.now(),
    });
    return referralCode;
  },
});

export const getMyAffiliateLinks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const links = await ctx.db
      .query("affiliates")
      .withIndex("by_affiliate_user", (q: any) => q.eq("affiliateUserId", user._id))
      .collect();

    return await Promise.all(
      links.map(async (l) => {
        const course = await ctx.db.get(l.courseId);
        const mentor = course ? await ctx.db.get(course.mentorId) : null;
        return {
          ...l,
          courseTitle: course?.title ?? "Unknown",
          mentorName: mentor?.name ?? "Unknown",
          mentorSlug: mentor?.slug ?? "",
          courseSlug: course?.slug ?? "",
        };
      })
    );
  },
});

export const getMentorAffiliates = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const links = await ctx.db
      .query("affiliates")
      .withIndex("by_course_id", (q: any) => q.eq("courseId", args.courseId))
      .collect();

    return await Promise.all(
      links.map(async (l) => {
        const user = await ctx.db.get(l.affiliateUserId);
        return { ...l, affiliateName: user?.name ?? "Unknown", affiliateEmail: user?.email ?? "" };
      })
    );
  },
});
