import React from 'react'
import { Button } from '../ui/button'
import { IEvent } from '@/lib/database/models/event.model'
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUserId } from '@/lib/actions/user.actions';

const CheckoutButton = async ({event}:{event:IEvent}) => {
  const user = await currentUser();
  const clerkId = user?.id as string;
  const userId = await getCurrentUserId(clerkId)
  const hasEventFinished = new Date(event.endDateTime)<new Date();
  
  return (
    <div>
       <Button size="lg" className='rounded-full '>Book Ticket</Button>
    </div>
  )
}

export default CheckoutButton
