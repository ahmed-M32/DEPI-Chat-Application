import express from "express";
import { register, login, logout, updateProfilePicture,removeProfilePicture, getCurrentUser } from "../controllers/auth.controller.js";
import { checkAuthentication } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", checkAuthentication, getCurrentUser);

router.put('/profile-picture', checkAuthentication, updateProfilePicture);
router.delete('/profile-picture', checkAuthentication, removeProfilePicture);


export default router;
