import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a mentor profile for the authenticated user
export const createProfile = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    bio: v.string(),
    expertise: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const clerkId = identity.subject;
    const now = Date.now();

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    // Check no existing mentor profile
    const existing = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) throw new Error("Mentor profile already exists");

    // Validate slug uniqueness
    const slugTaken = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (slugTaken) throw new Error("Slug already taken");

    return await ctx.db.insert("mentors", {
      userId: user._id,
      clerkId,
      name: args.name,
      slug: args.slug,
      bio: args.bio,
      expertise: args.expertise,
      avatarUrl: args.avatarUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get the authenticated user's mentor profile
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Public query — get mentor + published courses by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!mentor) return null;

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_mentor_id_status", (q) =>
        q.eq("mentorId", mentor._id).eq("status", "published")
      )
      .collect();

    return { mentor, courses };
  },
});

// Check if a slug is available
export const checkSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mentors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return { available: !existing };
  },
});

// Dashboard stats for the authenticated mentor
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) return null;

    // Aggregate enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", mentor._id))
      .collect();

    const totalEnrollments = enrollments.length;
    const totalRevenueCents = enrollments.reduce(
      (sum, e) => sum + e.amountPaidCents,
      0
    );

    // Published course count
    const publishedCourses = await ctx.db
      .query("courses")
      .withIndex("by_mentor_id_status", (q) =>
        q.eq("mentorId", mentor._id).eq("status", "published")
      )
      .collect();

    // Recent enrollments (last 10)
    const recent = enrollments
      .sort((a, b) => b.enrolledAt - a.enrolledAt)
      .slice(0, 10);

    const recentEnrollments = await Promise.all(
      recent.map(async (enrollment) => {
        const learner = await ctx.db.get(enrollment.learnerId);
        const course = await ctx.db.get(enrollment.courseId);
        return {
          id: enrollment._id,
          learnerName: learner?.name ?? "Unknown",
          courseTitle: course?.title ?? "Unknown",
          amountPaidCents: enrollment.amountPaidCents,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    return {
      totalEnrollments,
      totalRevenueCents,
      publishedCourseCount: publishedCourses.length,
      recentEnrollments,
    };
  },
});

// Get mentor by Clerk ID (used by server API routes)
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Update Stripe account by Clerk ID (used by Connect callback)
export const updateStripeAccountByClerkId = mutation({
  args: {
    clerkId: v.string(),
    stripeAccountId: v.string(),
    stripeAccountStatus: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("restricted")
    ),
  },
  handler: async (ctx, args) => {
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!mentor) throw new Error("Mentor not found");
    await ctx.db.patch(mentor._id, {
      stripeAccountId: args.stripeAccountId,
      stripeAccountStatus: args.stripeAccountStatus,
      updatedAt: Date.now(),
    });
  },
});

// Get mentor by ID (internal use)
export const getById = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mentorId);
  },
});

// Update subscription status (called by webhook)
export const updateSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    subscriptionId: v.string(),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete")
    ),
    subscriptionCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_stripe_customer_id", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();
    if (!mentor) return;
    await ctx.db.patch(mentor._id, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.subscriptionStatus,
      subscriptionCurrentPeriodEnd: args.subscriptionCurrentPeriodEnd,
      updatedAt: Date.now(),
    });
  },
});

// Update mentor profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    expertise: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) throw new Error("Mentor not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.expertise !== undefined) updates.expertise = args.expertise;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    await ctx.db.patch(mentor._id, updates);
  },
});

// Update Stripe account info after Connect onboarding
export const updateStripeAccount = mutation({
  args: {
    stripeAccountId: v.string(),
    stripeAccountStatus: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("restricted")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) throw new Error("Mentor not found");

    await ctx.db.patch(mentor._id, {
      stripeAccountId: args.stripeAccountId,
      stripeAccountStatus: args.stripeAccountStatus,
      updatedAt: Date.now(),
    });
  },
});
