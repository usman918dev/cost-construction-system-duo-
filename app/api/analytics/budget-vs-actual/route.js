import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import Project from '@/models/Project';
import Purchase from '@/models/Purchase';
import mongoose from 'mongoose';

async function handler(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const companyId = new mongoose.Types.ObjectId(userPayload.companyId);
  const projects = await Project.find({ companyId });

  const budgetComparison = await Promise.all(
    projects.map(async (project) => {
      const purchases = await Purchase.aggregate([
        { $match: { projectId: project._id, companyId } },
        { $group: { _id: null, totalSpent: { $sum: '$totalCost' } } },
      ]);

      const totalSpent = purchases.length > 0 ? purchases[0].totalSpent : 0;
      const remaining = project.totalBudget - totalSpent;
      const percentUsed = project.totalBudget > 0 ? (totalSpent / project.totalBudget) * 100 : 0;

      return {
        projectId: project._id,
        projectName: project.name,
        budget: project.totalBudget,
        spent: totalSpent,
        remaining,
        percentUsed: parseFloat(percentUsed.toFixed(2)),
      };
    })
  );

  return { budgetComparison };
}

export const GET = apiHandler(handler);
