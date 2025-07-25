import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  user: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.string()),
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
    // Fields for recommendation system
    lastRecommendationDate: v.optional(v.string()),
    recommended: v.optional(v.array(v.id('user'))),
    preferences: v.optional(
      v.object({
        minAge: v.number(),
        maxAge: v.number(),
        maxDistance: v.optional(v.number()),
        preferredLanguages: v.optional(v.array(v.string())),
        gender: v.optional(
          v.union(v.literal('male'), v.literal('female'), v.literal('non-binary'), v.literal('any'))
        ),
        interests: v.optional(v.array(v.string())),
      })
    ),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_age', ['age'])
    .index('by_country', ['country'])
    .index('by_username', ['username']),

  //firstuser and seconduser id combo is unique
  connection: defineTable({
    firstUserId: v.id('user'),
    secondUserId: v.id('user'),
    pairKey: v.string(),
    delayInHours: v.number(),
    chronicles: v.array(v.id('chronicle')),
    lastChronicleSentAt: v.optional(v.string()),
  })
    .index('by_pairKey', ['pairKey'])
    .index('by_firstUserId', ['firstUserId'])
    .index('by_secondUserId', ['secondUserId'])
    .index('by_lastChronicleSentAt', ['lastChronicleSentAt']),

  chronicle: defineTable({
    sender: v.id('user'),
    receiver: v.id('user'),
    content: v.string(),
    sentAt: v.string(), // timestamp
    connectionId: v.id('connection'),
  }).index('by_connectionId', ['connectionId']),
});
