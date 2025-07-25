import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createConnection = mutation({
  args: {
    firstUserClerkId: v.string(), // Changed to accept Clerk IDs
    secondUserClerkId: v.string(), // Changed to accept Clerk IDs
    pairKey: v.string(),
    delayInHours: v.number(),
    firstChronicle: v.object({
      senderClerkId: v.string(), // Changed to Clerk ID
      receiverClerkId: v.string(), // Changed to Clerk ID
      content: v.string(),
      sentAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { firstUserClerkId, secondUserClerkId, pairKey, delayInHours, firstChronicle } = args;
    // Look up users by their Clerk IDs to get Convex document IDs
    const firstUser = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', firstUserClerkId))
      .unique();

    const secondUser = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', secondUserClerkId))
      .unique();

    const senderUser = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', firstChronicle.senderClerkId))
      .unique();

    const receiverUser = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', firstChronicle.receiverClerkId))
      .unique();

    if (!firstUser || !secondUser || !senderUser || !receiverUser) {
      throw new Error('One or more users not found');
    }

    // Create connection with Convex document IDs
    const connectionId = await ctx.db.insert('connection', {
      firstUserId: firstUser._id,
      secondUserId: secondUser._id,
      pairKey,
      delayInHours,
      chronicles: [],
    });

    const chronicleId = await ctx.db.insert('chronicle', {
      sender: senderUser._id,
      receiver: receiverUser._id,
      content: firstChronicle.content,
      sentAt: firstChronicle.sentAt,
      connectionId,
    });

    // Update connection with chronicle
    await ctx.db.patch(connectionId, {
      lastChronicleSentAt: new Date().toISOString(),
      chronicles: [chronicleId],
    });

    return connectionId;
  },
});

// Helper function to get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique();
  },
});

export const getConnections = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // Get all connections for this user
    const connectionsAsFirst = await ctx.db
      .query('connection')
      .withIndex('by_firstUserId', (q) => q.eq('firstUserId', user._id))
      .collect();

    const connectionsAsSecond = await ctx.db
      .query('connection')
      .withIndex('by_secondUserId', (q) => q.eq('secondUserId', user._id))
      .collect();

    const allConnections = [...connectionsAsFirst, ...connectionsAsSecond];

    allConnections.sort(
      (a, b) =>
        new Date(b.lastChronicleSentAt ?? 0).getTime() -
        new Date(a.lastChronicleSentAt ?? 0).getTime()
    );

    // Collect all unique user IDs involved in these connections
    const userIds = Array.from(
      new Set(allConnections.flatMap((conn) => [conn.firstUserId, conn.secondUserId]))
    );

    // Fetch all user docs in parallel
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    // Map userId to user doc for easy lookup
    const userMap = new Map();
    users.forEach((u, i) => {
      if (u) userMap.set(userIds[i], u);
    });

    // Attach user data to each connection
    return allConnections.map((conn) => ({
      ...conn,
      firstUser: userMap.get(conn.firstUserId) ?? null,
      secondUser: userMap.get(conn.secondUserId) ?? null,
    }));
  },
});

// Fixed: Remove the invalid index usage
export const getConnectionWithChronicles = query({
  args: { id: v.id('connection') },
  handler: async (ctx, args) => {
    // 1. Fetch the connection by ID directly
    const connection = await ctx.db.get(args.id);

    if (!connection) {
      throw new Error('Connection not found');
    }

    // 2. Fetch all chronicles for this connection
    const chronicles = await ctx.db
      .query('chronicle')
      .withIndex('by_connectionId', (q) => q.eq('connectionId', args.id))
      .collect();

    // 3. Return both connection and chronicles
    return {
      connection,
      chronicles,
    };
  },
});
