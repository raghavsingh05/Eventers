import { NextRequest, NextResponse } from 'next/server';
import Order from '@/lib/database/models/order.model';
import { connectToDatabase } from '@/lib/database';
import Event from '@/lib/database/models/event.model';
import User from '@/lib/database/models/user.model';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUserId } from '@/lib/actions/user.actions';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { eventId, totalAmount } = await req.json();

    const user = await currentUser();
    const clerkId = user?.id as string;
    const userId = await getCurrentUserId(clerkId);

    const buyer = await User.findById(userId).select('_id firstName lastName');
    if (!buyer) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const event = await Event.findById(eventId).select('_id title');
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Check if the order already exists for the given event and user
    const existingOrder = await Order.findOne({
      event: event._id,
      buyer: buyer._id,
    });

    if (existingOrder) {
      return NextResponse.json(
        { message: 'Order already exists for this event' },
        { status: 409 }
      );
    }

    const newOrder = new Order({
      createdAt: new Date(),
      totalAmount,
      event: event._id,
      buyer: buyer._id,
      buyerFirstName: buyer.firstName,
      eventTitle: event.title,
    });

    await newOrder.save();

    return NextResponse.json(
      { message: 'Order placed successfully', order: newOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during checkout:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
