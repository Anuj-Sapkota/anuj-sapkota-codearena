import { Router } from "express";
import {
  applyForCreator,
  verifyOTP,
  updateCreatorStatus,
} from "../controllers/creator.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";

const router = Router();

// User routes (Authenticated students)
router.post("/apply", authenticateRequest, applyForCreator);
router.post("/verify", authenticateRequest, verifyOTP);

// Admin routes (Reviewing applications)
router.patch(
  "/admin/review",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  updateCreatorStatus,
);

export default router;
