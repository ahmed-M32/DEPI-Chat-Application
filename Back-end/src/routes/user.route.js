import express from "express";
import {
	register,
	login,
	logout,
	updateProfilePicture,
	removeProfilePicture,
	getCurrentUser,
} from "../controllers/auth.controller.js";
import { checkAuthentication } from "../middleware/auth.middleware.js";
import {
	loginRateLimiter,
	registerRateLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", registerRateLimiter, register);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);

// Protected routes
router.get("/me", checkAuthentication, getCurrentUser);

router.put("/profile-picture", checkAuthentication, updateProfilePicture);
router.delete("/profile-picture", checkAuthentication, removeProfilePicture);

export default router;
