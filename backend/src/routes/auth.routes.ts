import express from "express";
import authController from "../controllers/auth.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { verifyTurnstile } from "../middlewares/turnstile.middleware.js";

const router = express.Router();

// --- Standard Routes ---
router.post("/register", verifyTurnstile, authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authenticateRequest, authController.logoutUser);
router.post("/refresh", authController.refreshToken);
router.get("/me", authenticateRequest, authController.getMe);

// --- Password Recovery ---
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// --- OAuth Routes (The Fix is Here) ---
// Instead of calling passport directly, we call our controller to handle the "state"
router.get("/google", authController.initiateGoogleAuth);
router.get("/github", authController.initiateGithubAuth);

// Callbacks stay the same, but the Passport Strategy (updated previously) will read the state
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.oauthSignIn,
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  authController.oauthSignIn,
);

// --- Account Settings ---
router.post("/unlink", authenticateRequest, authController.unlinkOAuth);
router.post("/set-initial-password", authenticateRequest, authController.setInitialPassword);
router.delete("/delete-account", authenticateRequest, authController.deleteAccount);
router.post("/change-password", authenticateRequest, authController.changePassword);

export default router;