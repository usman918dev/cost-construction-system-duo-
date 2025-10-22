import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';

async function handler(request) {
  const userPayload = getUserFromRequest(request);

  if (!userPayload) {
    throw new ApiError('Unauthorized', 401);
  }

  const user = await User.findById(userPayload.sub).select('-password');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt,
    },
  };
}

export const GET = apiHandler(handler);
