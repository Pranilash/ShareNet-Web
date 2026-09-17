import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const VerifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "UNAUTHORIZED")
        }
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            throw new ApiError(401, "INVALID ACCESS TOKEN")
        }
        req.user = user
        next()
    } catch (error) {
        const statusCode = error instanceof ApiError 
            ? error.statusCode 
            : (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError" ? 401 : (error?.statusCode || 500));
        throw new ApiError(
            statusCode,
            error?.message || "UNAUTHORIZED"
        )
    }
})

export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (token) {
            const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedtoken?._id).select(
                "-password -refreshToken"
            )
            if (user) {
                req.user = user
            }
        }
    } catch (error) {
        // Silently proceed for optional auth
    }
    next()
})
