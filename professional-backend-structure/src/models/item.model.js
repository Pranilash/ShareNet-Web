import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
        photos: [
            {
                type: String
            }
        ],
        category: {
            type: String,
            enum: ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Kitchen', 'Other'],
            required: true
        },
        mode: {
            type: String,
            enum: ['RENT', 'SELL', 'GIVE'],
            required: true
        },
        price: {
            type: Number,
            validate: {
                validator: function(v) {
                    if (this.mode === 'RENT' || this.mode === 'SELL') {
                        return v != null && v >= 0;
                    }
                    return true;
                },
                message: 'Price is required for RENT and SELL modes'
            }
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

export const Item = mongoose.model("Item", itemSchema)
