import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  client: z.string().min(1, 'Client name is required'),
  location: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  totalBudget: z.number().min(0, 'Total budget must be at least 0'),
});

export const updateProjectSchema = createProjectSchema.partial();
