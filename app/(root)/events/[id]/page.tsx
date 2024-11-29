import { getEventById } from '@/lib/actions/event.actions'
import { formatDateTime } from '@/lib/utils';
import { SearchParamProps } from '@/types'
import Image from 'next/image';

const EventDetails = async({params: {id}}: SearchParamProps) =>{
    const event  = await getEventById(id);
    return(
        <section className='flex justify-center bg-primary-50 bg-dotted-pattern'>
            <div className='grid grid-col-1 md:grid-cols-2 2xl:max-w-7xl'> 
                <Image
                    src={event.imageUrl}
                    alt='hero image'
                    width={1000}
                    height={1000}
                    className='h-full min-h-[300px] object-cover object-center'
                />
                <div className='flex w-full flex-col gap-8 p-5 md:p-10'>
                    <div className='flex flex-col gap-6'>
                        <h2 className='h2-bold'>{event.title}</h2>
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                            <div className='flex gap-3'>
                                <p className='p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700'>
                                    {event.isFree? 'FREE':`₹${event.price}` }
                                </p>
                                <p className='p-medium-16 rounded-full bg-green-500/10 px-4 py-2.5 text-green-500'>
                                    {event.category.name}
                                </p>
                            </div>
                            <p className='p-medium-18 ml-2 mt-2 sm:mt-0'>
                                by{' '} <span className='text-primary-500'>{event.organizer.firstName} {event.organizer.lastName}</span>
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-5'>
                        <div className='flex gap-2 md:gap-3'>
                            <Image src="/assets/icons/calendar.svg" alt='calendar'
                            width={32}
                            height={32} />
                            <div className='p-medium-16 lg:p-regular-20 flex flex-wrap items-center'>
                                <p>{formatDateTime(event.startDateTime).dateOnly} /</p>
                                <p className='ml-1'>{formatDateTime(event.startDateTime).timeOnly} - {' '}</p>
                                <p className='ml-1'>{formatDateTime(event.endDateTime).timeOnly} {' '}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EventDetails
