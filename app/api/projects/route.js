import { apiHandler } from '@/lib/apiHandler';
import { createProjectSchema } from '@/lib/validators/projects';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import Project from '@/models/Project';

async function getProjects(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  // Filter projects by user's company
  const projects = await Project.find({ companyId: userPayload.companyId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return { projects };
}

async function createProject(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (userPayload.role !== ROLES.ADMIN) {
    throw new ApiError('Only admins can create projects', 403);
  }

  const body = await request.json();
  const project = await Project.create({
    ...body,
    createdBy: userPayload.sub,
    companyId: userPayload.companyId,
  });

  return { project };
}

export const GET = apiHandler(getProjects);
export const POST = apiHandler(createProject, { validator: createProjectSchema });
