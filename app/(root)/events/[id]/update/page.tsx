import EventForm from "@/components/shared/EventForm"
import { auth } from '@clerk/nextjs/server';

const UpdateEvent = async () => {
  const { userId } = await auth();
  const clerkId = userId as string;
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center se:text-left"> Create Event</h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={clerkId} type="Update" />
      </div>
    </>
  )
}

export default UpdateEvent
