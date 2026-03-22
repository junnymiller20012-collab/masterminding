import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users ────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("mentor"), v.literal("learner"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ── Mentors ──────────────────────────────────────────────
  mentors: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    slug: v.string(),
    bio: v.string(),
    expertise: v.string(),
    avatarStorageId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    // Stripe
    stripeCustomerId: v.optional(v.string()),
    stripeAccountId: v.optional(v.string()),
    stripeAccountStatus: v.optional(
      v.union(v.literal("pending"), v.literal("active"), v.literal("restricted"))
    ),
    // Subscription
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("trialing"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("incomplete")
      )
    ),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_slug", ["slug"])
    .index("by_stripe_customer_id", ["stripeCustomerId"]),

  // ── Courses ──────────────────────────────────────────────
  courses: defineTable({
    mentorId: v.id("mentors"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.string(),
    coverImageStorageId: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    priceCents: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    // AI-generated sales page
    salesPageHeadline: v.optional(v.string()),
    salesPageBody: v.optional(v.string()),
    salesPageGenerated: v.optional(v.boolean()),
    // Stats (denormalized for performance)
    enrollmentCount: v.number(),
    totalRevenueCents: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_mentor_id", ["mentorId"])
    .index("by_mentor_id_status", ["mentorId", "status"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // ── Course Sections ──────────────────────────────────────
  sections: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    lessons: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        videoStorageId: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        durationSeconds: v.optional(v.number()),
        order: v.number(),
        isFree: v.boolean(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_course_id", ["courseId"]),

  // ── Enrollments ──────────────────────────────────────────
  enrollments: defineTable({
    courseId: v.id("courses"),
    learnerId: v.id("users"),
    mentorId: v.id("mentors"),
    // Payment
    amountPaidCents: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("refunded"),
      v.literal("disputed")
    ),
    enrolledAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course_id", ["courseId"])
    .index("by_learner_id", ["learnerId"])
    .index("by_mentor_id", ["mentorId"])
    .index("by_learner_course", ["learnerId", "courseId"]),

  // ── Progress ─────────────────────────────────────────────
  progress: defineTable({
    enrollmentId: v.id("enrollments"),
    learnerId: v.id("users"),
    courseId: v.id("courses"),
    // Map of sectionIndex-lessonIndex → completed
    completedLessons: v.array(v.string()),
    lastAccessedAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_enrollment_id", ["enrollmentId"])
    .index("by_learner_course", ["learnerId", "courseId"]),

  // ── Payments ─────────────────────────────────────────────
  payments: defineTable({
    enrollmentId: v.optional(v.id("enrollments")),
    mentorId: v.id("mentors"),
    learnerId: v.optional(v.id("users")),
    type: v.union(
      v.literal("course_purchase"),
      v.literal("subscription"),
      v.literal("refund")
    ),
    amountCents: v.number(),
    platformFeeCents: v.number(),
    mentorPayoutCents: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeTransferId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    createdAt: v.number(),
  })
    .index("by_mentor_id", ["mentorId"])
    .index("by_enrollment_id", ["enrollmentId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"]),
});
