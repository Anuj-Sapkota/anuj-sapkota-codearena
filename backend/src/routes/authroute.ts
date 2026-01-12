import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import passport from "passport";
import authService from "../services/authService.js";
import { verifyTurnstile } from "../middlewares/verifyTurnstile.js";

const router = express.Router();
//-----------------------Standard Routes -------------------------------

//signup
router.post("/register", verifyTurnstile, authController.registerUser);

//sign in
router.post("/login",  authController.loginUser);

//logout user
router.post("/logout", authenticate, authController.logoutUser);

//refresh token
router.post("/refresh", authController.refreshToken);

//self 
router.get("/me", authenticate, authController.getMe);

//-------Password Recovery Routes---------------
//forgot password
router.post("/forgot-password", authController.forgotPassword);

//reset password
router.post("/reset-password/:token", authController.resetPassword);

//-------------------OAuth Routes -----------------------------
//google signin
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureFlash: "/login" }),
  authController.oauthSignIn
);
router.get("/github", passport.authenticate("github", { session: false }));

// callback
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  authController.oauthSignIn
);


export default router;
