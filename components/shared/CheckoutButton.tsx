import { Button } from '../ui/button'
import { IEvent } from '@/lib/database/models/event.model'
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUserId } from '@/lib/actions/user.actions';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import Checkout from './Checkout';

const CheckoutButton = async ({event}:{event:IEvent}) => {
  const user = await currentUser();
  const clerkId = user?.id as string;
  const userId = await getCurrentUserId(clerkId)
  const hasEventFinished = new Date(event.endDateTime) < new Date();
  
  return (
    <div className='flex items-center gap-3'>
       {hasEventFinished ? (
        <p className='p-2 text-red-400'>Sorry the event is ended</p>
       ) : (
        <>
          <SignedOut>
            <Button asChild className='button rounded-full' size="lg">
              <Link href='/sign-in'>
                Get Tickets
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
              <Checkout event={event} />
          </SignedIn>
        </>
       )}
    </div>
  )
}

export default CheckoutButton
