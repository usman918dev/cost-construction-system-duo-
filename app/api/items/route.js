import { apiHandler } from '@/lib/apiHandler';
import { createItemSchema } from '@/lib/validators/items';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Item from '@/models/Item';

async function getItems(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  const filter = { companyId: userPayload.companyId };
  if (categoryId) filter.categoryId = categoryId;

  const items = await Item.find(filter)
    .populate('categoryId', 'name')
    .populate('defaultVendor', 'name')
    .sort({ createdAt: -1 });

  return { items };
}

async function createItem(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const item = await Item.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { item };
}

export const GET = apiHandler(getItems);
export const POST = apiHandler(createItem, { validator: createItemSchema });
