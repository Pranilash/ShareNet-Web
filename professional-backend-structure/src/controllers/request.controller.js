import mongoose from 'mongoose';
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

    const transactionData = {
        item: request.item._id,
        owner: request.owner,
        requester: request.requester,
        request: request._id,
        mode: request.item.mode,
        agreedPrice: Number(request.proposedPrice) || Number(request.item.price) || 0
    };
    
    // Only add agreedDuration if it's a valid number
    if (request.proposedDuration && !isNaN(Number(request.proposedDuration))) {
        transactionData.agreedDuration = Number(request.proposedDuration);
    }
    
    const transaction = await Transaction.create(transactionData);

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

const instantClaim = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new ApiError(400, "Invalid item ID format");
    }

    const userId = req.user._id;

    // ATOMIC CONDITIONAL UPDATE:
    // Serialized write at storage engine level to eliminate read-modify-write race conditions.
    // Invariants enforced atomically:
    // 1. Item exists, isAvailable: true, instantClaim: true, mode: 'GIVE'.
    // 2. Requester is not owner (owner !== userId).
    // 3. Requester does not already have an active claim.
    // 4. Current count of active claims ('PENDING_PICKUP') < maxClaimers.
    const claimEntry = {
        user: userId,
        claimedAt: new Date(),
        status: 'PENDING_PICKUP'
    };

    const filter = {
        _id: itemId,
        instantClaim: true,
        mode: 'GIVE',
        isAvailable: true,
        owner: { $ne: userId },
        claimedBy: {
            $not: {
                $elemMatch: {
                    user: userId,
                    status: { $ne: 'CANCELLED' }
                }
            }
        },
        $expr: {
            $lt: [
                {
                    $size: {
                        $filter: {
                            input: { $ifNull: ["$claimedBy", []] },
                            as: "claim",
                            cond: { $eq: ["$$claim.status", "PENDING_PICKUP"] }
                        }
                    }
                },
                "$maxClaimers"
            ]
        }
    };

    const updatedItem = await Item.findOneAndUpdate(
        filter,
        {
            $push: { claimedBy: claimEntry }
        },
        { new: true }
    );

    // If atomic update returned null, diagnose exact invariant failure to report accurate 400
    if (!updatedItem) {
        const existing = await Item.findById(itemId);
        if (!existing) {
            throw new ApiError(404, "Item not found");
        }
        if (existing.owner.toString() === userId.toString()) {
            throw new ApiError(400, "You cannot claim your own item");
        }
        if (!existing.instantClaim) {
            throw new ApiError(400, "This item does not support instant claim");
        }
        if (existing.mode !== 'GIVE') {
            throw new ApiError(400, "Instant claim is only available for free items");
        }
        if (!existing.isAvailable) {
            throw new ApiError(400, "Item is no longer available");
        }
        const userClaim = existing.claimedBy.find(
            c => c.user.toString() === userId.toString() && c.status !== 'CANCELLED'
        );
        if (userClaim) {
            throw new ApiError(400, "You have already claimed this item");
        }
        const activeCount = existing.claimedBy.filter(c => c.status === 'PENDING_PICKUP').length;
        if (activeCount >= existing.maxClaimers) {
            throw new ApiError(400, "Maximum claimers reached for this item");
        }
        throw new ApiError(400, "Item claim failed concurrent capacity check");
    }

    // Check if max capacity is reached and atomically flag isAvailable = false
    const activeClaims = updatedItem.claimedBy.filter(c => c.status === 'PENDING_PICKUP').length;
    if (activeClaims >= updatedItem.maxClaimers) {
        await Item.updateOne(
            { _id: itemId, isAvailable: true },
            { $set: { isAvailable: false } }
        );
        updatedItem.isAvailable = false;
    }

    // Create the Request document with compensating rollback to prevent orphaned claims
    let request;
    try {
        request = await Request.create({
            item: itemId,
            requester: userId,
            owner: updatedItem.owner,
            description: 'Instant claim for free item',
            requestType: 'INSTANT_CLAIM',
            status: 'ACCEPTED',
            priority: activeClaims
        });
    } catch (createErr) {
        // Compensating rollback: atomic pull to restore database consistency
        await Item.updateOne(
            { _id: itemId },
            {
                $pull: {
                    claimedBy: {
                        user: userId,
                        status: 'PENDING_PICKUP'
                    }
                },
                $set: { isAvailable: true }
            }
        );
        throw new ApiError(500, `Claim reservation succeeded but request generation failed: ${createErr.message}`);
    }

    // Non-fatal notification delivery (notification failure should never fail an accepted claim)
    try {
        await createNotificationHelper(
            updatedItem.owner,
            'ITEM_CLAIMED',
            `${req.user.fullName || req.user.username} has claimed your item: ${updatedItem.title}`,
            request._id,
            'Request'
        );
    } catch (notifErr) {
        console.error("Non-fatal: notification failed during instantClaim:", notifErr.message);
    }

    return res.status(200).json(
        new ApiResponse(200, { item: updatedItem, request }, "ITEM CLAIMED SUCCESSFULLY")
    );
});

const getClaimQueue = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const item = await Item.findById(itemId)
        .populate('claimedBy.user', 'fullName username avatar trustScore');

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    if (item.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner can view the claim queue");
    }

    const queue = item.claimedBy
        .filter(claim => claim.status === 'PENDING_PICKUP')
        .sort((a, b) => a.claimedAt - b.claimedAt);

    return res.status(200).json(
        new ApiResponse(200, { queue, maxClaimers: item.maxClaimers }, "CLAIM QUEUE FETCHED SUCCESSFULLY")
    );
});

const confirmPickup = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    const isOwner = request.owner.toString() === req.user._id.toString();
    const isRequester = request.requester.toString() === req.user._id.toString();

    if (!isOwner && !isRequester) {
        throw new ApiError(403, "You are not authorized to confirm this pickup");
    }

    if (request.status !== 'ACCEPTED') {
        throw new ApiError(400, "Request must be accepted before confirming pickup");
    }

    request.status = 'COMPLETED';
    await request.save();

    if (request.item && request.requestType === 'INSTANT_CLAIM') {
        const itemId = request.item._id || request.item;
        await Item.updateOne(
            { _id: itemId, "claimedBy.user": request.requester, "claimedBy.status": "PENDING_PICKUP" },
            { $set: { "claimedBy.$.status": "COMPLETED" } }
        );
    }

    try {
        const notifyUser = isOwner ? request.requester : request.owner;
        await createNotificationHelper(
            notifyUser,
            'PICKUP_CONFIRMED',
            `Pickup confirmed for "${request.item.title}"`,
            request._id,
            'Request'
        );
    } catch (notifErr) {
        console.error("Non-fatal: notification failed during confirmPickup:", notifErr.message);
    }

    return res.status(200).json(
        new ApiResponse(200, request, "PICKUP CONFIRMED SUCCESSFULLY")
    );
});

const createCounterOffer = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { price, duration, message } = req.body;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the item owner can create a counter offer");
    }

    if (request.status !== 'PENDING' && request.status !== 'COUNTER_OFFERED') {
        throw new ApiError(400, "Cannot create counter offer for this request");
    }

    const normalizedDuration = typeof duration === 'number'
        ? { days: duration }
        : (duration && typeof duration === 'object' ? duration : { days: Number(duration) || 0 });

    request.counterOffer = {
        price,
        duration: normalizedDuration,
        message,
        proposedBy: req.user._id,
        status: 'PENDING'
    };

    request.negotiationHistory.push({
        type: 'COUNTER',
        price,
        duration,
        message,
        by: req.user._id,
        timestamp: new Date()
    });

    request.status = 'COUNTER_OFFERED';
    await request.save();

    await createNotificationHelper(
        request.requester,
        'COUNTER_OFFER_RECEIVED',
        `You received a counter offer for "${request.item.title}"`,
        request._id,
        'Request'
    );

    return res.status(200).json(
        new ApiResponse(200, request, "COUNTER OFFER CREATED SUCCESSFULLY")
    );
});

const respondToCounterOffer = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { accept } = req.body;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.requester.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the requester can respond to a counter offer");
    }

    if (request.status !== 'COUNTER_OFFERED' || !request.counterOffer) {
        throw new ApiError(400, "No pending counter offer to respond to");
    }

    request.negotiationHistory.push({
        type: accept ? 'ACCEPT' : 'REJECT',
        price: request.counterOffer.price,
        duration: request.counterOffer.duration,
        by: req.user._id,
        timestamp: new Date()
    });

    if (accept) {
        request.counterOffer.status = 'ACCEPTED';
        request.status = 'ACCEPTED';
        request.proposedPrice = request.counterOffer.price;
        request.proposedDuration = request.counterOffer.duration;

        const transaction = await Transaction.create({
            item: request.item._id,
            owner: request.owner,
            requester: request.requester,
            request: request._id,
            mode: request.item.mode,
            agreedPrice: request.counterOffer.price || request.item.price,
            agreedDuration: typeof request.counterOffer.duration === 'object' && request.counterOffer.duration !== null ? (request.counterOffer.duration.days || 1) : (Number(request.counterOffer.duration) || 1)
        });

        await Item.findByIdAndUpdate(request.item._id, { isAvailable: false });

        await createNotificationHelper(
            request.owner,
            'COUNTER_OFFER_ACCEPTED',
            `Your counter offer for "${request.item.title}" was accepted!`,
            transaction._id,
            'Transaction'
        );
    } else {
        request.counterOffer.status = 'REJECTED';
        request.status = 'PENDING';

        await createNotificationHelper(
            request.owner,
            'COUNTER_OFFER_REJECTED',
            `Your counter offer for "${request.item.title}" was rejected`,
            request._id,
            'Request'
        );
    }

    await request.save();

    return res.status(200).json(
        new ApiResponse(200, request, accept ? "COUNTER OFFER ACCEPTED" : "COUNTER OFFER REJECTED")
    );
});

const getItemRequests = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const item = await Item.findById(itemId);

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    if (item.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the item owner can view requests for this item");
    }

    const filter = { item: itemId };
    if (status) {
        filter.status = status;
    }

    const requests = await Request.find(filter)
        .populate('requester', 'fullName username avatar trustScore')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);

    await Item.findByIdAndUpdate(itemId, { $inc: { requestCount: 0 } });

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "ITEM REQUESTS FETCHED SUCCESSFULLY")
    );
});

const proposePickupDetails = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { location, proposedTime, instructions } = req.body;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    const isOwner = request.owner.toString() === req.user._id.toString();
    const isRequester = request.requester.toString() === req.user._id.toString();

    if (!isOwner && !isRequester) {
        throw new ApiError(403, "You are not authorized to propose pickup details");
    }

    if (request.status !== 'ACCEPTED') {
        throw new ApiError(400, "Request must be accepted before proposing pickup details");
    }

    request.pickupDetails = {
        location,
        proposedTime: new Date(proposedTime),
        instructions
    };
    await request.save();

    const notifyUser = isOwner ? request.requester : request.owner;
    await createNotificationHelper(
        notifyUser,
        'PICKUP_PROPOSED',
        `Pickup details proposed for "${request.item.title}"`,
        request._id,
        'Request'
    );

    return res.status(200).json(
        new ApiResponse(200, request, "PICKUP DETAILS PROPOSED SUCCESSFULLY")
    );
});

const confirmPickupDetails = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await Request.findById(requestId).populate('item');

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    const isOwner = request.owner.toString() === req.user._id.toString();
    const isRequester = request.requester.toString() === req.user._id.toString();

    if (!isOwner && !isRequester) {
        throw new ApiError(403, "You are not authorized to confirm pickup details");
    }

    if (!request.pickupDetails || !request.pickupDetails.proposedTime) {
        throw new ApiError(400, "No pickup details to confirm");
    }

    request.pickupDetails.confirmedTime = request.pickupDetails.proposedTime;
    await request.save();

    const notifyUser = isOwner ? request.requester : request.owner;
    await createNotificationHelper(
        notifyUser,
        'PICKUP_CONFIRMED',
        `Pickup details confirmed for "${request.item.title}" at ${request.pickupDetails.confirmedTime}`,
        request._id,
        'Request'
    );

    return res.status(200).json(
        new ApiResponse(200, request, "PICKUP DETAILS CONFIRMED SUCCESSFULLY")
    );
});

const updateClaimStatus = asyncHandler(async (req, res) => {
    const { claimId } = req.params;
    const { status } = req.body;

    if (!['PENDING_PICKUP', 'COMPLETED', 'CANCELLED'].includes(status)) {
        throw new ApiError(400, "Invalid claim status");
    }

    const item = await Item.findOne({ "claimedBy._id": claimId });
    if (!item) {
        throw new ApiError(404, "Claim not found");
    }

    if (item.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the item owner can update claim status");
    }

    const claim = item.claimedBy.id(claimId);
    if (!claim) {
        throw new ApiError(404, "Claim not found");
    }

    claim.status = status;
    const remainingActive = item.claimedBy.filter(c => c.status === 'PENDING_PICKUP' && c._id.toString() !== claimId.toString()).length;

    if (status === 'CANCELLED') {
        if (remainingActive < item.maxClaimers) {
            item.isAvailable = true;
        }
    } else if (status === 'COMPLETED' || remainingActive + 1 >= item.maxClaimers) {
        item.isAvailable = false;
    }
    await item.save();

    try {
        await createNotificationHelper(
            claim.user,
            'CLAIM_STATUS_UPDATED',
            `Your claim for "${item.title}" status changed to ${status}`,
            item._id,
            'Item'
        );
    } catch (notifErr) {
        console.error("Non-fatal: notification failed during updateClaimStatus:", notifErr.message);
    }

    return res.status(200).json(
        new ApiResponse(200, claim, "CLAIM STATUS UPDATED SUCCESSFULLY")
    );
});

export {
    createRequest,
    getMyRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getActiveRequests,
    instantClaim,
    getClaimQueue,
    confirmPickup,
    createCounterOffer,
    respondToCounterOffer,
    getItemRequests,
    proposePickupDetails,
    confirmPickupDetails,
    updateClaimStatus
};
