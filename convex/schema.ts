import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  user: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isOnboarded: v.boolean(),
    bio: v.optional(v.string()),
    age: v.optional(v.number()),
    dateOfBirth: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
    gender: v.optional(
      v.union(v.literal('male'), v.literal('female'), v.literal('non-binary'), v.literal('any'))
    ),
    languagesSpoken: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    // <— store real user‐Ids, not plain strings
    recommended: v.optional(v.array(v.id('user'))),
    lastRecommendationDate: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        minAge: v.number(),
        maxAge: v.number(),
        maxDistance: v.optional(v.number()),
        preferredLanguages: v.optional(v.array(v.string())),
        gender: v.optional(v.string()),
        interests: v.optional(v.array(v.string())),
      })
    ),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_age', ['age'])
    .index('by_country', ['country']),

  chronicles: defineTable({
    sender: v.id('user'),
    receiver: v.id('user'),
    content: v.string(),
    sentAt: v.optional(v.number()),
    status: v.union(v.literal('sending'), v.literal('delivered'), v.literal('read')),
  })
    .index('by_receiver_and_status', ['receiver', 'status'])
    .index('by_sender', ['sender'])
    .index('by_arrival_and_status', ['status', 'sentAt']),
});
