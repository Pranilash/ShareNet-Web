import { Router } from "express";
import {
    createPost,
    getPosts,
    getMyPosts,
    markResolved,
    deletePost
} from "../controllers/lostFound.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);

router.route("/").post(upload.single("photo"), createPost);
router.route("/").get(getPosts);
router.route("/my-posts").get(getMyPosts);
router.route("/:postId/resolve").patch(markResolved);
router.route("/:postId").delete(deletePost);

export default router;
