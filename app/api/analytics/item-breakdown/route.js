import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Purchase from '@/models/Purchase';

async function handler(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const projectId = searchParams.get('projectId');

  const matchStage = { companyId: userPayload.companyId };
  if (projectId) matchStage.projectId = projectId;

  const breakdown = await Purchase.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'items',
        localField: 'itemId',
        foreignField: '_id',
        as: 'item',
      },
    },
    { $unwind: '$item' },
    {
      $group: {
        _id: '$item.name',
        totalCost: { $sum: '$totalCost' },
        totalQuantity: { $sum: '$quantity' },
        purchaseCount: { $sum: 1 },
      },
    },
    { $sort: { totalCost: -1 } },
    { $limit: limit },
  ]);

  return { breakdown };
}

export const GET = apiHandler(handler);
