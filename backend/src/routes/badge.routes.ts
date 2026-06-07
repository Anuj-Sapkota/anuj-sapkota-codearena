import { Router } from "express";
import {
  getBadgeLibrary,
  adminCreateBadge,
  updateBadge,
  deleteBadge,
} from "../controllers/badge.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";
import { authorizeRequest } from "../middleware/authorize.middleware.js";

const router = Router();

// Every badge action requires being logged in
router.use(authenticateRequest);

// Publicly available to creators/students
router.get("/library", getBadgeLibrary);

// Authorize the user's request
router.use(authorizeRequest("ADMIN"));
// Admin only (You can add an isAdmin check here later)
router.post("/admin/create", adminCreateBadge);

router.put("/admin/:id", authenticateRequest, updateBadge);

router.delete("/admin/:id", authenticateRequest, deleteBadge);

export default router;
