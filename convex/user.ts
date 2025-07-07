import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Create a new user
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Default isOnboarded to false if not provided
    const isOnboarded = args.isOnboarded ?? false;
    return await ctx.db.insert('user', {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      firstName: args.firstName,
      lastName: args.lastName,
      isOnboarded,
    });
  },
});

// Update an existing user by clerkId
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isOnboarded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('user')
      .withIndex('clerkId', (q) => q.eq('clerkId', args.clerkId))
      .first();
    if (!user) throw new Error('User not found');
    return await ctx.db.patch(user._id, {
      email: args.email ?? user.email,
      imageUrl: args.imageUrl ?? user.imageUrl,
      firstName: args.firstName ?? user.firstName,
      lastName: args.lastName ?? user.lastName,
      isOnboarded: args.isOnboarded ?? user.isOnboarded,
    });
  },
});

// Delete a user by clerkId
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('user')
      .withIndex('clerkId', (q) => q.eq('clerkId', args.clerkId))
      .first();
    if (!user) throw new Error('User not found');
    return await ctx.db.delete(user._id);
  },
});
