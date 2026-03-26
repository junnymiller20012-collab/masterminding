import { query } from "./_generated/server";

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

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_mentor_id", (q: any) => q.eq("mentorId", mentor._id))
      .order("desc")
      .collect();

    return await Promise.all(
      payments.map(async (p) => {
        const enrollment = p.enrollmentId ? await ctx.db.get(p.enrollmentId) : null;
        const course = enrollment ? await ctx.db.get(enrollment.courseId) : null;
        return {
          ...p,
          courseTitle: course?.title ?? null,
        };
      })
    );
  },
});
