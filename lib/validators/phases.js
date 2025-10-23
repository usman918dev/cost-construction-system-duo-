import { z } from 'zod';

export const createPhaseSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.enum(['Grey', 'Finishing'], { message: 'Phase must be Grey or Finishing' }),
  description: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold']).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updatePhaseSchema = createPhaseSchema.partial().omit({ projectId: true });
