import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Gets the current authenticated user's profile from the database.
 * Returns null if the user is not authenticated or not found.
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    // Get the Clerk user identity
    const identity = await ctx.auth.getUserIdentity();

    // If there's no identity, the user isn't logged in
    if (!identity) {
      return null;
    }

    // Find the user document corresponding to the Clerk user ID (tokenIdentifier)
    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    return user;
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated: Cannot update profile.');
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found: Cannot update profile.');
    }

    const existingUsername = await ctx.db
      .query('user')
      .withIndex('by_username', (q) => q.eq('username', username))
      .unique();

    if (existingUsername) {
      throw new Error('Username already taken: Cannot update profile.');
    }

    await ctx.db.patch(user._id, { username });
  },
});
/**
 * Creates a new user in the database.
 * This is typically called from a Clerk webhook when a new user signs up.
 * It ensures a user record is created only once.
 */
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Avoid duplicates
    const existing = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique();
    if (existing) {
      return;
    }

    await ctx.db.insert('user', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      isOnboarded: false,
    });
  },
});

/**
 * Updates the user's profile with onboarding information.
 * This should be called after the user fills out their profile details for the first time.
 * It operates on the currently authenticated user for security.
 */

export const completeOnboardingProfile = mutation({
  args: {
    bio: v.string(),
    age: v.number(),
    city: v.string(),
    gender: v.union(
      v.literal('male'),
      v.literal('female'),
      v.literal('non-binary'),
      v.literal('any')
    ),
    dateOfBirth: v.optional(v.string()),
    country: v.string(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    name: v.string(),
    languagesSpoken: v.array(v.string()),
    interests: v.array(v.string()),
    preferences: v.object({
      minAge: v.number(),
      maxAge: v.number(),
      // Adding new preference fields to the Convex mutation arguments
      maxDistance: v.number(), // Maximum distance for pen pal search
      gender: v.union(
        v.literal('male'),
        v.literal('female'),
        v.literal('non-binary'),
        v.literal('any')
      ), // Preferred gender for pen pal
      preferredLanguages: v.array(v.string()), // Languages the pen pal should speak
      interests: v.array(v.string()), // Shared interests for pen pal matching
      preferredCountries: v.optional(v.array(v.string())), // Keeping original optional field
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated: Cannot update profile.');
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found: Cannot update profile.');
    }

    // Patch the user document with the new profile information and set isOnboarded to true.
    await ctx.db.patch(user._id, {
      ...args,
      isOnboarded: true,
    });
  },
});

export const updatePreferences = mutation({
  args: {
    preferences: v.object({
      minAge: v.number(),
      maxAge: v.number(),
      maxDistance: v.number(),
      gender: v.union(
        v.literal('male'),
        v.literal('female'),
        v.literal('non-binary'),
        v.literal('any')
      ),
      preferredLanguages: v.array(v.string()),
      interests: v.array(v.string()),
      preferredCountries: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { preferences }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated: Cannot update preferences.');
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found: Cannot update preferences.');
    }

    await ctx.db.patch(user._id, { preferences });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    storageId: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    languagesSpoken: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { name, bio, storageId, interests, languagesSpoken }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('User not found');

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    let imageUrl = user.imageUrl;

    // Handle new image upload
    if (storageId) {
      // Generate new URL
      imageUrl = (await ctx.storage.getUrl(storageId)) || '';
      if (!imageUrl) throw new Error('Failed to get image URL');

      // Delete old image if exists
      if (user.storageId) {
        await ctx.storage.delete(user.storageId);
      }
    }

    await ctx.db.patch(user._id, {
      name: name ?? user.name,
      bio: bio ?? user.bio,
      imageUrl,
      storageId: storageId ?? user.storageId,
      interests: interests ?? user.interests,
      languagesSpoken: languagesSpoken ?? user.languagesSpoken,
    });

    return { imageUrl };
  },
});

/**
 * Deletes the currently authenticated user's record from the database.
 * This is a destructive action and should be handled with care in the UI.
 */
export const deleteUser = mutation({
  // No arguments needed; it operates on the authenticated user.
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated: Cannot delete user.');
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found: Cannot delete user.');
    }

    // Note: In a real app, you might also want to delete associated data,
    // like letters sent or received by this user.

    await ctx.db.delete(user._id);
  },
});

/**
 * Deletes a user record from the database based on a Clerk ID.
 * This is intended to be used by webhooks and other server-side processes.
 * It is an internal function and should not be exposed directly to clients without proper authorization.
 */
export const deleteUserFromWebhook = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
      .unique();

    if (!user) {
      console.warn(`User with Clerk ID: ${clerkId} not found. Cannot delete.`);
      return;
    }

    await ctx.db.delete(user._id);
  },
});

export const get = query({
  args: { id: v.id('user') },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return user;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Generate and return the upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get the URL for a stored file by storage ID
 */
export const getUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const getUserByUsername = query({
  args: { search: v.string() },
  handler: async (ctx, { search }) => {
    const currentUser = await ctx.auth.getUserIdentity();

    if (!currentUser) return [];

    if (!search.trim()) return [];

    // Case-insensitive prefix search
    const users = await ctx.db
      .query('user')
      .withIndex('by_username', (q) =>
        q.gte('username', search.toLowerCase()).lt('username', search.toLowerCase() + '\uffff')
      )
      .take(20);

    return users
      .filter((u) => u.username !== currentUser.username)
      .map((u) => ({
        _id: u._id,
        clerkId: u.clerkId,
        username: u.username,
        name: u.name,
        imageUrl: u.imageUrl,
      }));
  },
});
