import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contact: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();
