import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser } from '@/lib/actions/user.actions';

// import { createUser } from '../../lib/actions/user.actions'; 

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or your environment variables.');
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const userData = evt.data;

    try {
      const newUser = await createUser({
        email: userData.email_addresses[0]?.email_address || '', // Email
        firstName: userData.first_name || '', // First name
        lastName: userData.last_name || '', // Last name
        clerkUserId: userData.id || '', // Clerk User ID
        username: userData.username || '', // Username
        photo: userData.image_url || '', // Photo URL
      });

      console.log('New user created:', newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error: Could not create user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
