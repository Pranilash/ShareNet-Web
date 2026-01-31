import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'AGREEMENT_PROPOSED', 'AGREEMENT_CONFIRMED', 'RETURN_PENDING', 'TRANSACTION_COMPLETED', 'DISPUTE_RAISED', 'NEW_MESSAGE', 'REMINDER', 'OVERDUE'],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        relatedTransaction: {
            type: Schema.Types.ObjectId,
            ref: "Transaction"
        },
        relatedRequest: {
            type: Schema.Types.ObjectId,
            ref: "Request"
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export const Notification = mongoose.model("Notification", notificationSchema)
