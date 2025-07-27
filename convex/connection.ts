import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getDeliveryInfo } from '../utils/deliveryTime';

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

const generateJibberish = (content: string): string => {
  const wordCount = content.trim().split(/\s+/).length;
  const jibberishWords = [];

  // Common jibberish words to create realistic-looking placeholder
  const jibberishVocabulary = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'reprehenderit',
    'in',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'dolore',
    'eu',
    'fugiat',
    'nulla',
    'pariatur',
  ];

  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * jibberishVocabulary.length);
    jibberishWords.push(jibberishVocabulary[randomIndex]);
  }

  return jibberishWords.join(' ');
};

export const getConnectionWithChronicles = query({
  args: {
    id: v.id('connection'),
  },
  handler: async (ctx, args) => {
    const { id } = args;

    // Get the current user's ID from authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('User must be authenticated');
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the connection
    const connection = await ctx.db.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Verify the user is part of this connection
    if (connection.firstUserId !== user._id && connection.secondUserId !== user._id) {
      throw new Error('User is not part of this connection');
    }

    // Get all chronicles for this connection
    const chronicles = await ctx.db
      .query('chronicle')
      .withIndex('by_connectionId', (q) => q.eq('connectionId', id))
      .collect();

    const processedChronicles = chronicles.map((chronicle) => {
      // Check if message is delivered

      const deliveryInfo = getDeliveryInfo(chronicle, connection.delayInHours);

      const delivered = deliveryInfo.delivered;
      const deliveryTime = deliveryInfo.timeLeft;

      return {
        ...chronicle,
        // For undelivered messages, generate jibberish of similar length
        content:
          !delivered && chronicle.receiver === user._id
            ? generateJibberish(chronicle.content)
            : chronicle.content,
        delivered,
        deliveryTime: deliveryTime,
      };
    });

    return {
      connection,
      chronicles: processedChronicles,
    };
  },
});

export const listConnections = query({
  args: { userId: v.id('user') },
  handler: async (ctx, { userId }) => {
    const connectionsAsFirst = await ctx.db
      .query('connection')
      .withIndex('by_firstUserId', (q) => q.eq('firstUserId', userId))
      .collect();

    const connectionsAsSecond = await ctx.db
      .query('connection')
      .withIndex('by_secondUserId', (q) => q.eq('secondUserId', userId))
      .collect();

    return [...connectionsAsFirst, ...connectionsAsSecond];
  },
});
