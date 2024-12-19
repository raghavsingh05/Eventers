import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getCurrentUserId } from '@/lib/actions/user.actions'
import { connectToDatabase } from '@/lib/database'
import { IOrder } from '@/lib/database/models/order.model'
import User from '@/lib/database/models/user.model'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'
import { SearchParamProps } from '@/types'
import { getOrdersByUser } from '@/lib/services/orderService'
import { IEvent } from '@/lib/database/models/event.model'

const ProfilePage = async({ searchParams }: SearchParamProps) => {
  const user = await currentUser();
    const clerkId = user?.id as string;
    const userId = await getCurrentUserId(clerkId)
    const ordersPage = Number(searchParams?.ordersPage) || 1;
    const eventsPage = Number(searchParams?.eventsPage) || 1;
    const orders = await getOrdersByUser({ userId, page: ordersPage})
    const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
    const organizedEvents = await getEventsByUser({userId, page:1})
  return (
    <>
      <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
        <div className='wrapper flex items-center justify-center sm:justify-between'>
          <h3 className='h3-bold text-center sm:text-left'>My tickets</h3>
          <Button asChild size="lg" className='button hidden sm:flex'>
            <Link href="/#events">
              Explore More Events
            </Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection 
          data={orderedEvents as IEvent[]}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>
      <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
        <div className='wrapper flex items-center justify-center sm:justify-between'>
          <h3 className='h3-bold text-center sm:text-left'>Events Organized</h3>
          <Button asChild size="lg" className='button hidden sm:flex'>
            <Link href="/events/create">
              Create New Event
            </Link>
          </Button>
        </div>
      </section>
      <section className='wrapper my-8'>
      <Collection
          data={organizedEvents?.data}
          emptyTitle="No events created yet"
          emptyStateSubtext="Create some now!"
          collectionType= "Events_Organized"
          limit={6}
          page={1}
          urlParamName='eventsPage'
          totalPages={2}

        />
      </section>
    </>
  )
}

export default ProfilePage
