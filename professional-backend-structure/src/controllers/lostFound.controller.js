import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { LostFound } from '../models/lostFound.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createPost = asyncHandler(async (req, res) => {
    const { title, description, type, location, date, contactInfo } = req.body;

    if (!title || !type) {
        throw new ApiError(400, "Title and type are required");
    }

    if (!['LOST', 'FOUND'].includes(type)) {
        throw new ApiError(400, "Type must be either LOST or FOUND");
    }

    let photos = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploaded = await uploadOnCloudinary(file.path);
            if (uploaded) {
                photos.push(uploaded.url);
            }
        }
    }

    const post = await LostFound.create({
        title,
        description,
        type,
        location,
        date: date || new Date(),
        contactInfo,
        photos,
        user: req.user._id
    });

    const populatedPost = await LostFound.findById(post._id)
        .populate('user', 'fullName username avatar campus');

    return res.status(201).json(
        new ApiResponse(201, populatedPost, "POST CREATED SUCCESSFULLY")
    );
});

const getPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, resolved } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    if (type && ['LOST', 'FOUND'].includes(type)) {
        filter.type = type;
    }

    if (resolved !== undefined) {
        filter.isResolved = resolved === 'true';
    }

    const posts = await LostFound.find(filter)
        .populate('user', 'fullName username avatar campus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await LostFound.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "POSTS FETCHED SUCCESSFULLY")
    );
});

const getMyPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await LostFound.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await LostFound.countDocuments({ user: req.user._id });

    return res.status(200).json(
        new ApiResponse(200, {
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "YOUR POSTS FETCHED SUCCESSFULLY")
    );
});

const markResolved = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await LostFound.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this post");
    }

    post.isResolved = true;
    post.resolvedAt = new Date();
    await post.save();

    return res.status(200).json(
        new ApiResponse(200, post, "POST MARKED AS RESOLVED")
    );
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await LostFound.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this post");
    }

    await LostFound.findByIdAndDelete(postId);

    return res.status(200).json(
        new ApiResponse(200, null, "POST DELETED SUCCESSFULLY")
    );
});

export {
    createPost,
    getPosts,
    getMyPosts,
    markResolved,
    deletePost
};
