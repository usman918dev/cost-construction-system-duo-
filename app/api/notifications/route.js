import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

async function getNotifications(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const isRead = searchParams.get('isRead');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const companyId = new mongoose.Types.ObjectId(userPayload.companyId);
  const filter = { 
    userId: new mongoose.Types.ObjectId(userPayload.sub),
    companyId 
  };

  if (isRead !== null && isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userPayload.sub),
    companyId,
    isRead: false,
  });

  return { notifications, unreadCount };
}

export const GET = apiHandler(getNotifications);
