import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Purchase from '@/models/Purchase';

async function handler(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  const matchStage = { companyId: userPayload.companyId };
  if (projectId) matchStage.projectId = projectId;

  const summary = await Purchase.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'phases',
        localField: 'phaseId',
        foreignField: '_id',
        as: 'phase',
      },
    },
    { $unwind: '$phase' },
    {
      $group: {
        _id: '$phase.name',
        totalCost: { $sum: '$totalCost' },
        purchaseCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { summary };
}

export const GET = apiHandler(handler);
