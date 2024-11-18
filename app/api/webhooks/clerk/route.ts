import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database';
import User from '@/lib/database/models/user.model';

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
      console.log('Received user data:', userData);

      // Connect to the database
      await connectToDatabase();
      console.log('Connected to database.');

      // Create the user in the database
      const newUser = await User.create({
        clerkId: userData.id || '', // Clerk ID
        email: userData.email_addresses[0]?.email_address || '', // Email
        username: userData.username || '', // Username
        firstName: userData.first_name || '', // First Name
        lastName: userData.last_name || '', // Last Name
        photo: userData.image_url || '', // Photo URL
      });

      console.log('New user created:', newUser);
    } catch (error) {
      console.error('Error creating user:', error instanceof Error ? error : new Error(String(error)));
      return new Response(JSON.stringify({ message: 'Error creating user', error: error instanceof Error ? error.message : 'Unknown error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
   }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
