import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const MILESTONES = [
  { id: "course_published",    label: "Publish your first course",     auto: true  },
  { id: "link_shared",         label: "Share your course link",        auto: false },
  { id: "first_3_students",    label: "Get your first 3 students",     auto: true  },
  { id: "first_100_dollars",   label: "Earn your first $100",          auto: true  },
  { id: "first_10_students",   label: "Reach 10 students",             auto: true  },
  { id: "first_500_dollars",   label: "Earn $500 in total revenue",    auto: true  },
  { id: "second_course",       label: "Launch a second course",        auto: true  },
  { id: "first_1000_dollars",  label: "Hit $1,000 in total revenue",   auto: true  },
  { id: "first_50_students",   label: "Reach 50 students",             auto: true  },
  { id: "first_100_students",  label: "Reach 100 students",            auto: true  },
];

export const getMilestones = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) return null;

    // Get milestone record
    const record = await ctx.db
      .query("mentorMilestones")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", mentor._id))
      .unique();

    const manualChecks: string[] = record?.manualChecks ?? [];
    const aiTips: Record<string, string> = record?.aiTips ?? {};

    // Compute auto milestones from real data
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", mentor._id))
      .collect();

    const totalStudents = enrollments.length;
    const totalRevenueCents = enrollments.reduce((s, e) => s + e.amountPaidCents, 0);

    const publishedCourses = await ctx.db
      .query("courses")
      .withIndex("by_mentor_id_status", (q) =>
        q.eq("mentorId", mentor._id).eq("status", "published")
      )
      .collect();

    function isAutoComplete(id: string): boolean {
      switch (id) {
        case "course_published":   return publishedCourses.length >= 1;
        case "first_3_students":   return totalStudents >= 3;
        case "first_100_dollars":  return totalRevenueCents >= 10000;
        case "first_10_students":  return totalStudents >= 10;
        case "first_500_dollars":  return totalRevenueCents >= 50000;
        case "second_course":      return publishedCourses.length >= 2;
        case "first_1000_dollars": return totalRevenueCents >= 100000;
        case "first_50_students":  return totalStudents >= 50;
        case "first_100_students": return totalStudents >= 100;
        default: return false;
      }
    }

    const milestones = MILESTONES.map((m) => ({
      ...m,
      completed: m.auto ? isAutoComplete(m.id) : manualChecks.includes(m.id),
      tip: aiTips[m.id] ?? null,
    }));

    // Mentor context for AI tips
    const firstCourse = publishedCourses[0] ?? null;

    return {
      milestones,
      totalStudents,
      totalRevenueCents,
      completedCount: milestones.filter((m) => m.completed).length,
      mentorContext: {
        name: mentor.name,
        expertise: mentor.expertise,
        courseTitle: firstCourse?.title ?? null,
        targetAudience: firstCourse?.targetAudience ?? null,
        priceCents: firstCourse?.priceCents ?? null,
      },
    };
  },
});

export const markManualComplete = mutation({
  args: { milestoneId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) throw new Error("Mentor not found");

    const record = await ctx.db
      .query("mentorMilestones")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", mentor._id))
      .unique();

    if (record) {
      if (!record.manualChecks.includes(args.milestoneId)) {
        await ctx.db.patch(record._id, {
          manualChecks: [...record.manualChecks, args.milestoneId],
          updatedAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("mentorMilestones", {
        mentorId: mentor._id,
        manualChecks: [args.milestoneId],
        aiTips: {},
        updatedAt: Date.now(),
      });
    }
  },
});

export const saveTip = mutation({
  args: { milestoneId: v.string(), tip: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const mentor = await ctx.db
      .query("mentors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!mentor) throw new Error("Mentor not found");

    const record = await ctx.db
      .query("mentorMilestones")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", mentor._id))
      .unique();

    const existingTips = record?.aiTips ?? {};
    const newTips = { ...existingTips, [args.milestoneId]: args.tip };

    if (record) {
      await ctx.db.patch(record._id, { aiTips: newTips, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("mentorMilestones", {
        mentorId: mentor._id,
        manualChecks: [],
        aiTips: newTips,
        updatedAt: Date.now(),
      });
    }
  },
});
