import { z } from 'zod';

export const createItemSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Item name is required'),
  unit: z.string().min(1, 'Unit is required'),
  ratePerUnit: z.number().min(0, 'Rate per unit must be at least 0'),
  defaultVendor: z.string().optional(),
});

export const updateItemSchema = createItemSchema.partial().omit({ categoryId: true });
