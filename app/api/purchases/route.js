import { apiHandler } from '@/lib/apiHandler';
import { createPurchaseSchema } from '@/lib/validators/purchases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Purchase from '@/models/Purchase';
import { checkProjectBudgetAlerts } from '@/lib/notificationService';

async function getPurchases(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const phaseId = searchParams.get('phaseId');
  const categoryId = searchParams.get('categoryId');

  const filter = { companyId: userPayload.companyId };
  if (projectId) filter.projectId = projectId;
  if (phaseId) filter.phaseId = phaseId;
  if (categoryId) filter.categoryId = categoryId;

  const purchases = await Purchase.find(filter)
    .populate('itemId', 'name unit')
    .populate('categoryId', 'name')
    .populate('phaseId', 'name')
    .populate('projectId', 'name')
    .populate('vendorId', 'name')
    .populate('createdBy', 'name')
    .sort({ purchaseDate: -1 });

  return { purchases };
}

async function createPurchase(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const purchase = await Purchase.create({
    ...body,
    createdBy: userPayload.sub,
    companyId: userPayload.companyId,
  });

  // Check budget alerts after purchase
  if (purchase.projectId) {
    await checkProjectBudgetAlerts(purchase.projectId, userPayload.companyId);
  }

  return { purchase };
}

export const GET = apiHandler(getPurchases);
export const POST = apiHandler(createPurchase, { validator: createPurchaseSchema });
