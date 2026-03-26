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

// Create a Lemon Squeezy Checkout session for a course purchase
export const createCheckoutSession = action({
  args: {
    courseId: v.id("courses"),
    couponCode: v.optional(v.string()),
  },
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

    // Apply coupon discount if provided
    let finalPriceCents = course.priceCents;
    let appliedCouponCode: string | undefined;
    if (args.couponCode && course.priceCents > 0) {
      const coupon = await ctx.runQuery(api.coupons.validate, {
        code: args.couponCode,
        courseId: args.courseId,
      });
      if (coupon) {
        finalPriceCents = Math.max(
          100, // Lemon Squeezy minimum $1.00
          Math.round(course.priceCents * (1 - coupon.discountPercent / 100))
        );
        appliedCouponCode = coupon.code;
      }
    }

    const lsApiKey = process.env.LEMONSQUEEZY_API_KEY;
    const lsVariantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    const lsStoreId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!lsApiKey || !lsVariantId || !lsStoreId) throw new Error("Lemon Squeezy not configured");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lsApiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            custom_price: finalPriceCents,
            product_options: {
              name: course.title,
              redirect_url: `${appUrl}/learn/${args.courseId}?enrolled=1`,
            },
            checkout_data: {
              custom: {
                courseId: args.courseId,
                learnerId: user._id,
                mentorId: course.mentorId,
                couponCode: appliedCouponCode ?? "",
              },
            },
          },
          relationships: {
            store: { data: { type: "stores", id: lsStoreId } },
            variant: { data: { type: "variants", id: lsVariantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Lemon Squeezy checkout failed: ${err}`);
    }

    const json = await response.json();
    return json.data.attributes.url;
  },
});

// Internal mutation used by enrollFree action
export const insertFreeEnrollment = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.status !== "published") throw new Error("Course is not available");
    if (course.priceCents !== 0) throw new Error("Course is not free");

    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_learner_course", (q: any) =>
        q.eq("learnerId", user._id).eq("courseId", args.courseId)
      )
      .unique();
    if (existing) return { enrollmentId: existing._id, alreadyEnrolled: true };

    const now = Date.now();
    const enrollmentId = await ctx.db.insert("enrollments", {
      courseId: args.courseId,
      learnerId: user._id,
      mentorId: course.mentorId,
      amountPaidCents: 0,
      currency: course.currency,
      stripePaymentIntentId: "free",
      status: "active",
      enrolledAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.courseId, {
      enrollmentCount: course.enrollmentCount + 1,
      totalRevenueCents: course.totalRevenueCents,
      updatedAt: now,
    });

    return { enrollmentId, alreadyEnrolled: false };
  },
});

// Direct enrollment for free courses — also sends email notifications
export const enrollFree = action({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const result = await ctx.runMutation(api.enrollments.insertFreeEnrollment, {
      courseId: args.courseId,
    });

    if (result.alreadyEnrolled) return result.enrollmentId;

    // Send notification emails
    try {
      const emailData = await ctx.runQuery(api.enrollments.getEnrollmentEmailData, {
        mentorId: (await ctx.runQuery(api.courses.getById, { courseId: args.courseId }))!.mentorId,
        courseId: args.courseId,
        learnerId: (await ctx.runQuery(api.users.getMe))!._id,
      });

      if (emailData) {
        const resendKey = process.env.RESEND_API_KEY;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.masterminding.app";
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@masterminding.app";

        if (resendKey) {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);

          // Email to mentor
          if (emailData.mentorEmail) {
            await resend.emails.send({
              from: `MasterMinding <${fromEmail}>`,
              to: emailData.mentorEmail,
              subject: `New free enrollment! ${emailData.learnerName} just enrolled in "${emailData.courseTitle}"`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
                  <div style="background:#0F766E;padding:24px 32px;border-radius:12px 12px 0 0">
                    <h1 style="color:white;margin:0;font-size:22px">New student enrolled! 🎓</h1>
                  </div>
                  <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
                    <p style="margin:0 0 20px;font-size:16px">
                      <strong>${emailData.learnerName}</strong> just enrolled in
                      <strong>"${emailData.courseTitle}"</strong> for free.
                    </p>
                    <a href="${appUrl}/students" style="background:#0F766E;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">
                      View Students →
                    </a>
                  </div>
                </div>
              `,
            });
          }

          // Email to student
          const user = await ctx.runQuery(api.users.getMe);
          const learnerEmail = user?.email;
          if (learnerEmail) {
            await resend.emails.send({
              from: `MasterMinding <${fromEmail}>`,
              to: learnerEmail,
              subject: `You're enrolled in "${emailData.courseTitle}"! Here's your access link`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
                  <div style="background:#0F766E;padding:24px 32px;border-radius:12px 12px 0 0">
                    <h1 style="color:white;margin:0;font-size:22px">Welcome to the course! 🎓</h1>
                  </div>
                  <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
                    <p style="margin:0 0 20px;font-size:16px">
                      Hi ${emailData.learnerName}, you're now enrolled in <strong>"${emailData.courseTitle}"</strong> by ${emailData.mentorName}. You have lifetime access.
                    </p>
                    <a href="${appUrl}/learn/${args.courseId}" style="background:#0F766E;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;font-size:15px;margin-bottom:24px">
                      Start Learning Now →
                    </a>
                  </div>
                </div>
              `,
            });
          }
        }
      }
    } catch (e) {
      // Email failure should not block enrollment
      console.error("Failed to send enrollment email:", e);
    }

    return result.enrollmentId;
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

// Fetch data needed to send sale notification emails (called from webhook via HTTP client)
export const getEnrollmentEmailData = query({
  args: {
    mentorId: v.id("mentors"),
    courseId: v.id("courses"),
    learnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) return null;
    const mentorUser = await ctx.db.get(mentor.userId);
    const course = await ctx.db.get(args.courseId);
    const learner = await ctx.db.get(args.learnerId);
    return {
      mentorEmail: mentorUser?.email ?? null,
      mentorName: mentor.name,
      courseTitle: course?.title ?? "your course",
      courseSlug: course?.slug ?? "",
      mentorSlug: mentor.slug,
      learnerName: learner?.name ?? "A new student",
      learnerEmail: learner?.email ?? null,
      priceCents: course?.priceCents ?? 0,
    };
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

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_learner_id", (q: any) => q.eq("learnerId", user._id))
      .collect();

    return await Promise.all(
      enrollments.map(async (e) => {
        const course = await ctx.db.get(e.courseId);
        const sections = await ctx.db
          .query("sections")
          .withIndex("by_course_id", (q: any) => q.eq("courseId", e.courseId))
          .collect();
        const progress = await ctx.db
          .query("progress")
          .withIndex("by_learner_course", (q: any) =>
            q.eq("learnerId", user._id).eq("courseId", e.courseId)
          )
          .unique();
        const mentor = course ? await ctx.db.get(course.mentorId) : null;
        return {
          ...e,
          courseTitle: course?.title ?? "Unknown Course",
          coverImageUrl: course?.coverImageUrl ?? null,
          mentorName: mentor?.name ?? "",
          totalSections: sections.length,
          completedCount: progress?.completedLessons.length ?? 0,
        };
      })
    );
  },
});
