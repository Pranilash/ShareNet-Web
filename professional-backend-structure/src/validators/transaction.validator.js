import { z } from 'zod';
import { objectIdSchema } from './request.validator.js';

export const proposeAgreementSchema = z.object({
    params: z.object({
        transactionId: objectIdSchema
    }),
    body: z.object({
        rentalPrice: z.coerce.number().min(0, "Rental price cannot be negative").optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        terms: z.string().min(3, "Terms must be at least 3 characters").optional(),
        securityDeposit: z.coerce.number().min(0).optional()
    })
});

export const disputeSchema = z.object({
    params: z.object({
        transactionId: objectIdSchema
    }),
    body: z.object({
        reason: z.string().min(3, "Reason must be at least 3 characters"),
        description: z.string().min(3, "Description must be at least 3 characters").optional()
    })
});
