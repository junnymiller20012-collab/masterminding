import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Called on first sign-in to create or update the user record
export const upsert = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const clerkId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      role: "mentor",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Returns the current authenticated user or null
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
