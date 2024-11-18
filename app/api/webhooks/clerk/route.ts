import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser } from '@/lib/actions/user.actions';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error('SIGNING_SECRET is missing.');
    return new Response('Error: Missing SIGNING_SECRET', { status: 500 });
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
      // Ensure that username and lastName are set
      const username = userData.external_accounts?.[0]?.username || `${userData.first_name}${userData.last_name}`;
      const lastName = userData.last_name || userData.first_name || 'Unknown';

      // Ensure that firstName, lastName, and username are non-empty
      if (!username || !lastName || !userData.first_name) {
        throw new Error('Missing required user details: username, firstName, or lastName');
      }

      const newUser = await createUser({
        email: userData.email_addresses?.[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: lastName,          // Ensure last name is populated
        clerkId: userData.id || '',  // Use clerkId here
        username: username,          // Ensure username is populated
        photo: userData.image_url || '',
      });

      console.log('New user created:', newUser);
      return new Response('User created successfully', { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating user:', error.message);
        return new Response(
          JSON.stringify({ message: 'Error creating user', error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('Unexpected error:', error);
        return new Response(
          JSON.stringify({ message: 'Error creating user', error: 'Unknown error occurred' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
