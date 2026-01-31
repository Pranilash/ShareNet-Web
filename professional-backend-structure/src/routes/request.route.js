import { Router } from "express";
import {
    createRequest,
    getMyRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getActiveRequests
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

export default router;
