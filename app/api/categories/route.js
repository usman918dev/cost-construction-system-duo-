import { apiHandler } from '@/lib/apiHandler';
import { createCategorySchema } from '@/lib/validators/categories';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Category from '@/models/Category';

async function getCategories(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const phaseId = searchParams.get('phaseId');

  const filter = { companyId: userPayload.companyId };
  if (phaseId) filter.phaseId = phaseId;

  const categories = await Category.find(filter).populate('phaseId', 'name').sort({ createdAt: -1 });

  return { categories };
}

async function createCategory(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const category = await Category.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { category };
}

export const GET = apiHandler(getCategories);
export const POST = apiHandler(createCategory, { validator: createCategorySchema });
