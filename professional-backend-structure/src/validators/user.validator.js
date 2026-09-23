import { z } from 'zod';

export const registerUserSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(60),
        username: z.string().min(3, "Username must be at least 3 characters").max(30).toLowerCase().trim(),
        email: z.string().email("Invalid email address").toLowerCase().trim(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        campus: z.string().optional(),
        college: z.string().optional()
    })
});

export const loginUserSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address").toLowerCase().trim().optional(),
        username: z.string().toLowerCase().trim().optional(),
        password: z.string().min(1, "Password is required")
    }).refine(data => data.email || data.username, {
        message: "Either email or username is required to login",
        path: ["email"]
    })
});

export const sendOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address").toLowerCase().trim()
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address").toLowerCase().trim(),
        otp: z.string().length(6, "OTP must be exactly 6 digits")
    })
});
