import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
    {
        requester: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        item: {
            type: Schema.Types.ObjectId,
            ref: "Item"
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String
        },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
            default: 'PENDING'
        },
        matchedOwners: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
)

export const Request = mongoose.model("Request", requestSchema)
