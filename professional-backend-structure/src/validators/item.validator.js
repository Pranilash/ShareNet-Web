import { z } from 'zod';
import { objectIdSchema } from './request.validator.js';

export const createItemSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Title must be at least 2 characters").max(100),
        description: z.string().min(5, "Description must be at least 5 characters"),
        category: z.string().min(2, "Category is required"),
        mode: z.enum(['RENT', 'SELL', 'GIVE'], {
            errorMap: () => ({ message: "Mode must be RENT, SELL, or GIVE" })
        }),
        price: z.coerce.number().min(0, "Price cannot be negative").optional(),
        instantClaim: z.coerce.boolean().optional(),
        maxClaimers: z.coerce.number().int().min(1).optional()
    })
});

export const itemParamsSchema = z.object({
    params: z.object({
        id: objectIdSchema.optional(),
        itemId: objectIdSchema.optional()
    }).refine(p => p.id || p.itemId, {
        message: "Item ID is required in URL parameters",
        path: ["id"]
    })
});
