import mongoose, { Schema } from "mongoose";

const lostFoundSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ['LOST', 'FOUND'],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        photo: {
            type: String
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        isResolved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export const LostFound = mongoose.model("LostFound", lostFoundSchema)
