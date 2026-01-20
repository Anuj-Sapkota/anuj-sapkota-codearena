import express from "express";
import authController from "../controllers/auth.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { verifyTurnstile } from "../middlewares/turnstile.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";

const router = express.Router();
//-----------------------Standard Routes -------------------------------

//signup
router.post("/register", verifyTurnstile, authController.registerUser);

//sign in
router.post("/login", authController.loginUser); // add turnstile----for DEVELOPMENT ONLY

//logout user
router.post("/logout", authenticateRequest, authController.logoutUser);

//refresh token
router.post("/refresh", authController.refreshToken);

//self
router.get("/me", authenticateRequest, authController.getMe);

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
//unlink
router.post("/unlink", authenticateRequest, authController.unlinkOAuth);

//set-inti
router.post(
  "/set-initial-password", 
  authenticateRequest,
  authController.setInitialPassword
);

//delete the account
router.delete("/delete-account", authenticateRequest, authController.deleteAccount);

//change password
router.post("/change-password", authenticateRequest, authController.changePassword);
export default router;
