import { apiHandler } from '@/lib/apiHandler';
import { createCompanySchema } from '@/lib/validators/companies';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import Company from '@/models/Company';

async function getCompanies(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  // Only allow users to see their own company
  const company = await Company.findById(userPayload.companyId);

  if (!company) throw new ApiError('Company not found', 404);

  return { company };
}

async function createCompany(request) {
  const body = await request.json();
  
  const company = await Company.create(body);

  return { company };
}

export const GET = apiHandler(getCompanies);
export const POST = apiHandler(createCompany, { validator: createCompanySchema });
