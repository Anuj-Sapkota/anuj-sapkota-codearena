import { Router } from "express";
import {
  applyForCreator,
  verifyOTP,
  getAllPendingCreators,
  approveOrRejectCreator,
} from "../controllers/creator.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";

const router = Router();

// --- USER ROUTES (Authenticated Students) ---
router.post("/apply", authenticateRequest, applyForCreator);
router.post("/verify", authenticateRequest, verifyOTP);

// --- ADMIN ROUTES (Reviewing Applications) ---

// Get all pending applications for the admin dashboard
router.get(
  "/pending-creators", 
  authenticateRequest, 
  authorizeRequest("ADMIN"), 
  getAllPendingCreators
);

// Unified route for both Approving and Rejecting (with reason)
router.patch(
  "/admin/review",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  approveOrRejectCreator
);

export default router;