import { apiHandler } from '@/lib/apiHandler';
import { updatePhaseSchema } from '@/lib/validators/phases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Phase from '@/models/Phase';

async function getPhase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const phase = await Phase.findOne({ _id: id, companyId: userPayload.companyId }).populate(
    'projectId',
    'name'
  );

  if (!phase) throw new ApiError('Phase not found', 404);

  return { phase };
}

async function updatePhase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const body = await request.json();

  const phase = await Phase.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!phase) throw new ApiError('Phase not found', 404);

  return { phase };
}

async function deletePhase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const phase = await Phase.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!phase) throw new ApiError('Phase not found', 404);

  return { message: 'Phase deleted successfully' };
}

export const GET = apiHandler(getPhase);
export const PUT = apiHandler(updatePhase, { validator: updatePhaseSchema });
export const DELETE = apiHandler(deletePhase);
