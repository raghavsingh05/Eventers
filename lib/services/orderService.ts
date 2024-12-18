import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import User from '@/lib/database/models/user.model';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/database';
import { handleError } from '@/lib/utils';

export async function getOrdersByEvent({
  searchString,
  eventId,
}: { searchString: string; eventId: string }) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error('Event ID is required');

    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $match: { event: eventObjectId },
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
        $match: { 'buyer.firstName': { $regex: new RegExp(searchString, 'i') } },
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: { $concat: ['$buyer.firstName', ' ', '$buyer.lastName'] },
        },
      },
    ]);

    return orders;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: { userId: string; limit?: number; page: number }) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error('User ID is required');

    const skipAmount = (Number(page) - 1) * limit;

    const orders = await Order.find({ buyer: new ObjectId(userId) })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        select: '_id title imageUrl createdAt startDateTime endDateTime price',
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });      

    const ordersCount = await Order.countDocuments({
      buyer: new ObjectId(userId),
    });

    return {
      data: orders,
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
}
