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

const router = Router();

router.use(VerifyJWT);

router.route("/").post(createRequest);
router.route("/my-requests").get(getMyRequests);
router.route("/received").get(getReceivedRequests);
router.route("/active").get(getActiveRequests);
router.route("/:requestId/accept").post(acceptRequest);
router.route("/:requestId/reject").post(rejectRequest);
router.route("/:requestId/cancel").post(cancelRequest);

router.post("/instant-claim/:itemId", instantClaim);
router.get("/claim-queue/:itemId", getClaimQueue);
router.patch("/claims/:claimId/status", updateClaimStatus);

// Pickup routes with aliases for frontend compatibility
router.patch("/:requestId/confirm-pickup", confirmPickup);
router.route("/:requestId/pickup-details").post(proposePickupDetails);
router.route("/:requestId/pickup").post(proposePickupDetails);
router.route("/:requestId/confirm-pickup-details").patch(confirmPickupDetails).post(confirmPickupDetails);
router.route("/:requestId/pickup/confirm").post(confirmPickupDetails).patch(confirmPickupDetails);

// Counter offer routes supporting both POST and PATCH
router.post("/:requestId/counter-offer", createCounterOffer);
router.route("/:requestId/counter-offer/respond").patch(respondToCounterOffer).post(respondToCounterOffer);

router.get("/item/:itemId", getItemRequests);

export default router;
