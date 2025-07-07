import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  user: defineTable({
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isOnboarded: v.boolean(),
  })
    .index('clerkId', ['clerkId']) // Removed third argument to fix error
    .index('email', ['email']), // Removed third argument to fix error
});

export default schema;
