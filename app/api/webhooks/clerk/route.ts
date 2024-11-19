import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser, deleteUser } from '@/lib/actions/user.actions';

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

  try {
    if (eventType === 'user.created') {
      const userData = evt.data;
      await createUser({
        email: userData.email_addresses[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        clerkId: userData.id || '',
        username: userData.username || '',
        photo: userData.image_url || '',
      });
    } else if (eventType === 'user.updated') {
      const userData = evt.data;
      await updateUser(userData.id, {
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        username: userData.username || '',
        photo: userData.image_url || '',
      });
    } else if (eventType === 'user.deleted') {
      const userData = evt.data;
      await deleteUser(userData.id || '');
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing event:', error);
    return new Response(JSON.stringify({ message: 'Error processing event', error }), { status: 500 });
  }
}
