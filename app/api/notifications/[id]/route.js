import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

async function markAsRead(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = params;
  const companyId = new mongoose.Types.ObjectId(userPayload.companyId);

  const notification = await Notification.findOneAndUpdate(
    { 
      _id: id, 
      userId: new mongoose.Types.ObjectId(userPayload.sub),
      companyId 
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  return { notification };
}

async function deleteNotification(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = params;
  const companyId = new mongoose.Types.ObjectId(userPayload.companyId);

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: new mongoose.Types.ObjectId(userPayload.sub),
    companyId,
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  return { message: 'Notification deleted successfully' };
}

export const PATCH = apiHandler(markAsRead);
export const DELETE = apiHandler(deleteNotification);
