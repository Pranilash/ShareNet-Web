import { Router } from "express";
import { 
    registerUser, loginUser, logOutUser, refreshAccessToken,
    changeCurrentpassword, getCurrentUser, UpdateAccountDetails,
    updateUserAvatar, getUserProfile, getTransactionHistory,
    getColleges, sendOTP, verifyOTP
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    registerUserSchema,
    loginUserSchema,
    sendOtpSchema,
    verifyOtpSchema
} from "../validators/user.validator.js";

const router = Router();

// Public routes
router.route("/register").post(upload.single("avatar"), validate(registerUserSchema), registerUser);
router.route("/login").post(validate(loginUserSchema), loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/colleges").get(getColleges);
router.route("/send-otp").post(validate(sendOtpSchema), sendOTP);
router.route("/verify-otp").post(validate(verifyOtpSchema), verifyOTP);

// Protected routes
router.route("/logout").post(VerifyJWT, logOutUser);
router.route("/change-password").post(VerifyJWT, changeCurrentpassword);
router.route("/current-user").get(VerifyJWT, getCurrentUser);
router.route("/update-account").patch(VerifyJWT, UpdateAccountDetails);
router.route("/avatar").patch(VerifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/profile/:userId").get(VerifyJWT, getUserProfile);
router.route("/transactions").get(VerifyJWT, getTransactionHistory);

export default router;
