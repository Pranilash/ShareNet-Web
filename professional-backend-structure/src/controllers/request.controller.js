import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Request } from '../models/request.model.js';
import { Item } from '../models/item.model.js';
import { Transaction } from '../models/transaction.model.js';
import { createNotificationHelper } from './notification.controller.js';

const createRequest = asyncHandler(async (req, res) => {
    const { item: itemId, itemId: altItemId, message, description, proposedDuration, proposedPrice } = req.body;
    const finalItemId = itemId || altItemId;

    if (!finalItemId) {
        throw new ApiError(400, "Item ID is required");
    }

    const item = await Item.findById(finalItemId);

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    if (!item.isAvailable) {
        throw new ApiError(400, "Item is not available");
    }

    if (item.owner.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot request your own item");
    }

    const existingRequest = await Request.findOne({
        item: finalItemId,
        requester: req.user._id,
        status: 'PENDING'
    });

    if (existingRequest) {
        throw new ApiError(400, "You already have a pending request for this item");
    }

    const request = await Request.create({
        item: finalItemId,
        requester: req.user._id,
        owner: item.owner,
        description: description || message,
        proposedDuration,
        proposedPrice
    });

    await createNotificationHelper(
        item.owner,
        'REQUEST_RECEIVED',
        `New request for your item: ${item.title}`,
        request._id,
        'Request'
    );

    const populatedRequest = await Request.findById(request._id)
        .populate('item', 'title photos mode price')
        .populate('requester', 'fullName username avatar trustScore');

    return res.status(201).json(
        new ApiResponse(201, populatedRequest, "REQUEST CREATED SUCCESSFULLY")
    );
});

const getMyRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { requester: req.user._id };
    if (status) {
        filter.status = status;
    }

    const requests = await Request.find(filter)
        .populate('item', 'title photos mode price')
        .populate('owner', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "REQUESTS FETCHED SUCCESSFULLY")
    );
});

const getReceivedRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // First get all items owned by this user
    const userItems = await Item.find({ owner: req.user._id }).select('_id');
    const itemIds = userItems.map(item => item._id);

    // Find requests where owner is set OR where the item belongs to this user
    const filter = {
        $or: [
            { owner: req.user._id },
            { item: { $in: itemIds } }
        ]
    };
    if (status) {
        filter.status = status;
    }

    const requests = await Request.find(filter)
        .populate('item', 'title photos mode price')
        .populate('requester', 'fullName username avatar trustScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "RECEIVED REQUESTS FETCHED SUCCESSFULLY")
    );
});

const acceptRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    // Ensure owner is set (backward compatibility)
    if (!request.owner && request.item) {
        request.owner = request.item.owner;
        await request.save();
    }

    if (request.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to accept this request");
    }

    if (request.status !== 'PENDING') {
        throw new ApiError(400, "Request is not pending");
    }

    request.status = 'ACCEPTED';
    await request.save();

    const transaction = await Transaction.create({
        item: request.item._id,
        owner: request.owner,
        requester: request.requester,
        request: request._id,
        mode: request.item.mode,
        agreedPrice: request.proposedPrice || request.item.price,
        agreedDuration: request.proposedDuration || request.item.duration
    });

    await Item.findByIdAndUpdate(request.item._id, { isAvailable: false });

    await createNotificationHelper(
        request.requester,
        'REQUEST_ACCEPTED',
        `Your request for "${request.item.title}" has been accepted!`,
        transaction._id,
        'Transaction'
    );

    return res.status(200).json(
        new ApiResponse(200, { request, transaction }, "REQUEST ACCEPTED SUCCESSFULLY")
    );
});

const rejectRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    // Ensure owner is set (backward compatibility)
    if (!request.owner && request.item) {
        request.owner = request.item.owner;
        await request.save();
    }

    if (request.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to reject this request");
    }

    if (request.status !== 'PENDING') {
        throw new ApiError(400, "Request is not pending");
    }

    request.status = 'REJECTED';
    request.rejectionReason = reason;
    await request.save();

    await createNotificationHelper(
        request.requester,
        'REQUEST_REJECTED',
        `Your request for "${request.item.title}" has been rejected`,
        request._id,
        'Request'
    );

    return res.status(200).json(
        new ApiResponse(200, request, "REQUEST REJECTED SUCCESSFULLY")
    );
});

const cancelRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.requester.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to cancel this request");
    }

    if (request.status !== 'PENDING') {
        throw new ApiError(400, "Only pending requests can be cancelled");
    }

    request.status = 'CANCELLED';
    await request.save();

    return res.status(200).json(
        new ApiResponse(200, request, "REQUEST CANCELLED SUCCESSFULLY")
    );
});

const getActiveRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
        $or: [
            { owner: req.user._id },
            { requester: req.user._id }
        ],
        status: 'PENDING'
    };

    const requests = await Request.find(filter)
        .populate('item', 'title photos mode price')
        .populate('owner', 'fullName username avatar')
        .populate('requester', 'fullName username avatar trustScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "ACTIVE REQUESTS FETCHED SUCCESSFULLY")
    );
});

export {
    createRequest,
    getMyRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getActiveRequests
};
