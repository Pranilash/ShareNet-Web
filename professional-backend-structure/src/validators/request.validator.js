import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, {
    message: "Must be a valid 24-character hexadecimal MongoDB ObjectId"
});

export const instantClaimSchema = z.object({
    params: z.object({
        itemId: objectIdSchema
    })
});

export const createRequestSchema = z.object({
    body: z.object({
        item: objectIdSchema.optional(),
        itemId: objectIdSchema.optional(),
        description: z.string().min(3, "Description must be at least 3 characters").optional(),
        message: z.string().min(3, "Message must be at least 3 characters").optional(),
        proposedPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
        rentalDays: z.coerce.number().int().min(1, "Rental days must be at least 1").optional(),
        proposedDuration: z.coerce.number().int().min(1, "Proposed duration must be at least 1").optional(),
        requestType: z.enum(['RENT', 'BUY', 'BORROW', 'INSTANT_CLAIM']).optional()
    }).refine(data => data.item || data.itemId, {
        message: "Either 'item' or 'itemId' is required",
        path: ["item"]
    })
});

export const counterOfferSchema = z.object({
    params: z.object({
        requestId: objectIdSchema
    }),
    body: z.object({
        price: z.coerce.number().min(0, "Price cannot be negative"),
        duration: z.coerce.number().int().min(1, "Duration must be at least 1 day"),
        message: z.string().optional()
    })
});

export const respondCounterOfferSchema = z.object({
    params: z.object({
        requestId: objectIdSchema
    }),
    body: z.object({
        accept: z.boolean({ required_error: "Decision 'accept' (boolean) is required" })
    })
});

export const pickupDetailsSchema = z.object({
    params: z.object({
        requestId: objectIdSchema
    }),
    body: z.object({
        location: z.string().min(2, "Location is required and must be at least 2 characters"),
        proposedTime: z.string().datetime({ message: "Proposed time must be a valid ISO 8601 datetime string" }).optional().or(z.string().min(3)),
        instructions: z.string().optional()
    })
});

export const updateClaimStatusSchema = z.object({
    params: z.object({
        claimId: objectIdSchema
    }),
    body: z.object({
        status: z.enum(['PENDING_PICKUP', 'COMPLETED', 'CANCELLED'], {
            errorMap: () => ({ message: "Status must be PENDING_PICKUP, COMPLETED, or CANCELLED" })
        })
    })
});
