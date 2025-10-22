import { apiHandler } from '@/lib/apiHandler';
import { updateCategorySchema } from '@/lib/validators/categories';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Category from '@/models/Category';

async function getCategory(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const category = await Category.findOne({ _id: id, companyId: userPayload.companyId }).populate(
    'phaseId',
    'name'
  );

  if (!category) throw new ApiError('Category not found', 404);

  return { category };
}

async function updateCategory(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const body = await request.json();

  const category = await Category.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!category) throw new ApiError('Category not found', 404);

  return { category };
}

async function deleteCategory(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const category = await Category.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!category) throw new ApiError('Category not found', 404);

  return { message: 'Category deleted successfully' };
}

export const GET = apiHandler(getCategory);
export const PUT = apiHandler(updateCategory, { validator: updateCategorySchema });
export const DELETE = apiHandler(deleteCategory);
