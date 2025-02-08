import express, { Router } from "express";
import { register ,login ,logout, updateProfilePic } from "../controllers/auth.controller.js";
import { checkAuthentication } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup",register)
router.post("/login",login)
router.post("/logout",logout)
router.post("/update-profile-pic",checkAuthentication,updateProfilePic)
export default router;

