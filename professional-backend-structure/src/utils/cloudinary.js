import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from "./ApiError.js"
import dotenv from 'dotenv'

dotenv.config({ path: '.env' });

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        //file successfully uploaded
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new ApiError(
            500,
            `Cloudinary error: ${error.message || error}`
        )
    }
}

export { uploadOnCloudinary }
