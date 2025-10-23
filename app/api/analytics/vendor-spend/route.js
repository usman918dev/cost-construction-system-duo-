import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Purchase from '@/models/Purchase';
import mongoose from 'mongoose';

async function handler(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  const companyId = new mongoose.Types.ObjectId(userPayload.companyId);
  const matchStage = { companyId };
  if (projectId) matchStage.projectId = new mongoose.Types.ObjectId(projectId);

  const vendorSpend = await Purchase.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { id: '$vendor._id', name: { $ifNull: ['$vendor.name', 'Unknown'] } },
        totalSpend: { $sum: '$totalCost' },
        purchaseCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpend: -1 } },
    {
      $project: {
        _id: '$_id.id',
        name: '$_id.name',
        totalSpend: 1,
        purchaseCount: 1,
      },
    },
  ]);

  return { vendorSpend };
}

export const GET = apiHandler(handler);
