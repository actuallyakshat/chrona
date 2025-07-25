import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';

// Define the webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  try {
    const event = await request.json();

    if (!event || !event.type) {
      return new Response('Invalid webhook payload', { status: 400 });
    }

    switch (event.type) {
      case 'user.created': {
        const user = event.data;
        await ctx.runMutation(api.user.createUser, {
          clerkId: user.id,
          email: user.email_addresses?.[0]?.email_address || '',
          name:
            user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || user.last_name || '',
          imageUrl: user.image_url || undefined,
        });
        break;
      }
      case 'user.deleted': {
        const user = event.data;
        await ctx.runMutation(api.user.deleteUserFromWebhook, { clerkId: user.id });
        break;
      }
      default:
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Set up HTTP router
const http = httpRouter();

// Register route for Clerk webhooks
http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

// Export the router
export default http;
