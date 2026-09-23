import { Router } from "express";
import {
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
} from "../controllers/request.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createRequestSchema,
    instantClaimSchema,
    counterOfferSchema,
    respondCounterOfferSchema,
    pickupDetailsSchema,
    updateClaimStatusSchema
} from "../validators/request.validator.js";

const router = Router();

router.use(VerifyJWT);

router.route("/").post(validate(createRequestSchema), createRequest);
router.route("/my-requests").get(getMyRequests);
router.route("/received").get(getReceivedRequests);
router.route("/active").get(getActiveRequests);
router.route("/:requestId/accept").post(acceptRequest);
router.route("/:requestId/reject").post(rejectRequest);
router.route("/:requestId/cancel").post(cancelRequest);

router.post("/instant-claim/:itemId", validate(instantClaimSchema), instantClaim);
router.get("/claim-queue/:itemId", getClaimQueue);
router.patch("/claims/:claimId/status", validate(updateClaimStatusSchema), updateClaimStatus);

// Pickup routes with aliases for frontend compatibility
router.patch("/:requestId/confirm-pickup", confirmPickup);
router.route("/:requestId/pickup-details").post(validate(pickupDetailsSchema), proposePickupDetails);
router.route("/:requestId/pickup").post(validate(pickupDetailsSchema), proposePickupDetails);
router.route("/:requestId/confirm-pickup-details").patch(confirmPickupDetails).post(confirmPickupDetails);
router.route("/:requestId/pickup/confirm").post(confirmPickupDetails).patch(confirmPickupDetails);

// Counter offer routes supporting both POST and PATCH
router.post("/:requestId/counter-offer", validate(counterOfferSchema), createCounterOffer);
router.route("/:requestId/counter-offer/respond")
    .patch(validate(respondCounterOfferSchema), respondToCounterOffer)
    .post(validate(respondCounterOfferSchema), respondToCounterOffer);

router.get("/item/:itemId", getItemRequests);

export default router;
