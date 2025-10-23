import { z } from 'zod';

export const createCategorySchema = z.object({
  phaseId: z.string().min(1, 'Phase ID is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  level: z.number().min(0).max(3).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ phaseId: true });
