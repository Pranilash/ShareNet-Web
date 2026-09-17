import { Router } from "express";
import {
    createItem,
    updateItem,
    deleteItem,
    markUnavailable,
    getMyItems,
    getAllItems,
    getItemById,
    getRecommendations
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected static subpaths (MUST be declared before parameterized /:itemId)
router.route("/my-items").get(VerifyJWT, getMyItems);
router.route("/recommendations").get(VerifyJWT, getRecommendations);
router.route("/").post(VerifyJWT, upload.array("photos", 5), createItem);

// Protected parameterized routes
router.route("/:itemId").patch(VerifyJWT, updateItem);
router.route("/:itemId").delete(VerifyJWT, deleteItem);
router.route("/:itemId/availability").patch(VerifyJWT, markUnavailable);

// Public / optionally authenticated routes
router.route("/").get(optionalVerifyJWT, getAllItems);
router.route("/:itemId").get(optionalVerifyJWT, getItemById);

export default router;
