import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const sendChronicle = mutation({
  args: {
    connectionId: v.id('connection'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { connectionId, content } = args;

    // Get the current user's ID from authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('User must be authenticated to send a chronicle');
    }

    // Get the user record to get the proper user ID
    const user = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the connection to determine the recipient
    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Determine the receiver (the other person in the connection)
    const receiverId =
      connection.firstUserId === user._id ? connection.secondUserId : connection.firstUserId;

    // Verify the current user is part of this connection
    if (connection.firstUserId !== user._id && connection.secondUserId !== user._id) {
      throw new Error('User is not part of this connection');
    }

    // Create the new chronicle
    const chronicleId = await ctx.db.insert('chronicle', {
      sender: user._id,
      receiver: receiverId,
      content,
      sentAt: new Date().toISOString(),
      connectionId,
    });

    // Update the connection's chronicles array
    const updatedChronicles = [...connection.chronicles, chronicleId];
    await ctx.db.patch(connectionId, {
      lastChronicleSentAt: new Date().toISOString(),
      chronicles: updatedChronicles,
    });

    return chronicleId;
  },
});

// Optional: Get chronicles for a connection (useful for real-time updates)
export const getChroniclesForConnection = mutation({
  args: {
    connectionId: v.id('connection'),
  },
  handler: async (ctx, args) => {
    const { connectionId } = args;

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

    // Verify the user is part of this connection
    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.firstUserId !== user._id && connection.secondUserId !== user._id) {
      throw new Error('User is not part of this connection');
    }

    // Get all chronicles for this connection
    const chronicles = await ctx.db
      .query('chronicle')
      .withIndex('by_connectionId', (q) => q.eq('connectionId', connectionId))
      .collect();

    return chronicles;
  },
});
