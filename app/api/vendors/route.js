import { apiHandler } from '@/lib/apiHandler';
import { createVendorSchema } from '@/lib/validators/vendors';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Vendor from '@/models/Vendor';

async function getVendors(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const vendors = await Vendor.find({ companyId: userPayload.companyId }).sort({ createdAt: -1 });

  return { vendors };
}

async function createVendor(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const vendor = await Vendor.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { vendor };
}

export const GET = apiHandler(getVendors);
export const POST = apiHandler(createVendor, { validator: createVendorSchema });
