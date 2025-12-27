import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();
//signup
router.post("/register", authController.registerUser);

//sign in
router.post("/login", authController.loginUser);

//refresh token
router.post("/refresh", authController.refreshToken);

//logout user
// router.post("/logout", authenticate, authController.logoutUser);

export default router;
