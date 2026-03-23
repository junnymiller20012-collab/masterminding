import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

// Create a Stripe Checkout session for a course purchase
export const createCheckoutSession = action({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.runQuery(api.users.getMe);
    if (!user) throw new Error("User not found");

    const course = await ctx.runQuery(api.courses.getById, { courseId: args.courseId });
    if (!course) throw new Error("Course not found");
    if (course.status !== "published") throw new Error("Course is not available");

    // Check not already enrolled
    const existing = await ctx.runQuery(api.enrollments.checkEnrollment, {
      courseId: args.courseId,
    });
    if (existing) throw new Error("Already enrolled");

    const mentor = await ctx.runQuery(api.mentors.getById, { mentorId: course.mentorId });
    if (!mentor) throw new Error("Mentor not found");

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe not configured");

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: course.currency,
            unit_amount: course.priceCents,
            product_data: { name: course.title },
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: args.courseId,
        learnerId: user._id,
        mentorId: course.mentorId,
      },
      success_url: `${appUrl}/learn/${args.courseId}?enrolled=1`,
      cancel_url: `${appUrl}/${mentor.slug}/${course.slug}`,
      ...(mentor.stripeAccountId && mentor.stripeAccountStatus === "active"
        ? {
            payment_intent_data: {
              application_fee_amount: Math.round(course.priceCents * 0.1),
              transfer_data: { destination: mentor.stripeAccountId },
            },
          }
        : {}),
    });

    return session.url!;
  },
});

// Called by webhook after successful payment — idempotent
export const fulfillPurchase = mutation({
  args: {
    courseId: v.id("courses"),
    learnerId: v.id("users"),
    mentorId: v.id("mentors"),
    amountPaidCents: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency check
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", args.learnerId).eq("courseId", args.courseId)
      )
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    const enrollmentId = await ctx.db.insert("enrollments", {
      courseId: args.courseId,
      learnerId: args.learnerId,
      mentorId: args.mentorId,
      amountPaidCents: args.amountPaidCents,
      currency: args.currency,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "active",
      enrolledAt: now,
      updatedAt: now,
    });

    const platformFeeCents = Math.round(args.amountPaidCents * 0.1);
    await ctx.db.insert("payments", {
      enrollmentId,
      mentorId: args.mentorId,
      learnerId: args.learnerId,
      type: "course_purchase",
      amountCents: args.amountPaidCents,
      platformFeeCents,
      mentorPayoutCents: args.amountPaidCents - platformFeeCents,
      currency: args.currency,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "succeeded",
      createdAt: now,
    });

    // Update course stats
    const course = await ctx.db.get(args.courseId);
    if (course) {
      await ctx.db.patch(args.courseId, {
        enrollmentCount: course.enrollmentCount + 1,
        totalRevenueCents: course.totalRevenueCents + args.amountPaidCents,
        updatedAt: now,
      });
    }

    return enrollmentId;
  },
});

// Check if current user is enrolled in a course
export const checkEnrollment = query({
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
      .query("enrollments")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", user._id).eq("courseId", args.courseId)
      )
      .unique();
  },
});

// Get all students enrolled in the mentor's courses
export const listMentorStudents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_mentor_id", (q: any) => q.eq("mentorId", mentor._id))
      .collect();

    const results = await Promise.all(
      enrollments.map(async (e) => {
        const learner = await ctx.db.get(e.learnerId);
        const course = await ctx.db.get(e.courseId);
        return {
          enrollmentId: e._id,
          learnerId: e.learnerId,
          learnerName: learner?.name ?? "Unknown",
          learnerEmail: learner?.email ?? "",
          courseId: e.courseId,
          courseTitle: course?.title ?? "Unknown Course",
          amountPaidCents: e.amountPaidCents,
          enrolledAt: e.enrolledAt,
        };
      })
    );

    return results.sort((a, b) => b.enrolledAt - a.enrolledAt);
  },
});

// Get all enrollments for a learner
export const listMyEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("enrollments")
      .withIndex("by_learner_id", (q: any) => q.eq("learnerId", user._id))
      .collect();
  },
});
