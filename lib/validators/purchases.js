import { z } from 'zod';

export const createPurchaseSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  phaseId: z.string().min(1, 'Phase ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  pricePerUnit: z.number().min(0, 'Price per unit must be at least 0'),
  vendorId: z.string().optional(),
  invoiceUrl: z.string().optional(),
  purchaseDate: z.string().or(z.date()).optional(),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();
