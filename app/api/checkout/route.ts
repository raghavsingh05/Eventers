import { NextRequest, NextResponse } from 'next/server';
import Order from '@/lib/database/models/order.model';
import { connectToDatabase } from '@/lib/database';
import Event from '@/lib/database/models/event.model';
import User from '@/lib/database/models/user.model';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUserId } from '@/lib/actions/user.actions';
import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from '@/types';
import { ObjectId } from 'mongodb';
import { handleError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { eventId, eventTitle, totalAmount } = await req.json();

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

export async function getOrdersByEvent({
  searchString,
  eventId,
}: GetOrdersByEventParams) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error('Event ID is required');

    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $match: {
          event: eventObjectId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $match: {
          'buyer.firstName': { $regex: new RegExp(searchString, 'i') },
        },
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error('User ID is required');

    const skipAmount = (Number(page) - 1) * limit;

    // Fetch orders and populate event data with imageUrl
    const orders = await Order.find({ buyer: new ObjectId(userId as string) })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        select: '_id title imageUrl price', // Include imageUrl here
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    const ordersCount = await Order.countDocuments({
      buyer: new ObjectId(userId as string),
    });

    // Return the structured response
    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}