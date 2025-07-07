import { httpRouter } from 'convex/server';
import { api } from './_generated/api';
import { httpAction } from './_generated/server';

const handleClerkWebhook = httpAction(async (ctx, request) => {
  try {
    // Get the webhook signing secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return new Response('Configuration error', { status: 500 });
    }

    // Get the raw body text and headers
    const body = await request.text();
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // Verify required headers are present
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing required Svix headers');
      return new Response('Missing required headers', { status: 400 });
    }

    // Verify the webhook signature
    const isValid = verifyWebhookSignature(
      body,
      svixId,
      svixTimestamp,
      svixSignature,
      webhookSecret
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse the event after verification
    const event = JSON.parse(body);
    console.log('Verified event -> ', event);

    if (!event || !event.type) {
      return new Response('Invalid webhook payload', { status: 400 });
    }

    console.log('Received Clerk event:', event.type);

    switch (event.type) {
      case 'user.created': {
        const user = event.data;
        await ctx.runMutation(api.user.createUser, {
          clerkId: user.id,
          email: user.email_addresses?.[0]?.email_address || '',
          imageUrl: user.image_url || undefined,
          firstName: user.first_name || undefined,
          lastName: user.last_name || undefined,
          isOnboarded: false,
        });
        console.log('User created:', user.id);
        break;
      }
      case 'user.updated': {
        const user = event.data;
        await ctx.runMutation(api.user.updateUser, {
          clerkId: user.id,
          email: user.email_addresses?.[0]?.email_address,
          imageUrl: user.image_url,
          firstName: user.first_name,
          lastName: user.last_name,
          // isOnboarded is not updated from Clerk, so omit
        });
        console.log('User updated:', user.id);
        break;
      }
      case 'user.deleted': {
        const user = event.data;
        await ctx.runMutation(api.user.deleteUser, {
          clerkId: user.id,
        });
        console.log('User deleted:', user.id);
        break;
      }
      default:
        console.log('Unhandled event:', event.type);
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Function to verify webhook signature using Svix format
// Using Web Crypto API (no "use node" needed)
async function verifyWebhookSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  try {
    const signedPayload = `${svixId}.${svixTimestamp}.${body}`;

    // Decode the base64 secret
    const secretBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the payload
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signedPayload)
    );
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    // Parse and check signatures
    const signatures = svixSignature.split(',');
    for (const sig of signatures) {
      const [version, signature] = sig.split(',');
      if (version === 'v1' && signature === computedSignature) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

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
