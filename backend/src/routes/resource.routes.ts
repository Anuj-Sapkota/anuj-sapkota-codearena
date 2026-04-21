import { Router } from "express";
import {
  createSeries,
  deleteResource,
  getMyResources,
  getResourceById,
  getResourceDashboard,
  updateResource,
  updateResourceBadge,
  getPublicResources,
  getCreatorStats,
  incrementViewCount,
  completeModule,
} from "../controllers/resource.controller.js";
import {
  saveAssignment,
  getAssignment,
  submitAssignment,
} from "../controllers/assignment.controller.js";
import { authenticateRequest, optionalAuth } from "../middleware/auth.middleware.js";
import { authorizeRequest } from "../middleware/authorize.middleware.js";

const router = Router();

// ── Public named routes (must be before /:id wildcard) ───────────────────────
router.get("/explore", getPublicResources);

// ── Protected named routes (must be before /:id wildcard) ────────────────────
router.get("/my-resources", authenticateRequest, getMyResources);
router.get("/creator/stats", authenticateRequest, getCreatorStats);
router.post("/create-series", authenticateRequest, authorizeRequest("CREATOR"), createSeries);
router.post("/complete-module", authenticateRequest, completeModule);

// Assignment named routes (before /:id)
router.put("/:resourceId/assignment", authenticateRequest, saveAssignment);
router.get("/:resourceId/assignment", authenticateRequest, getAssignment);
router.post("/assignment/:assignmentId/submit", authenticateRequest, submitAssignment);

// ── Wildcard /:id routes (LAST — catches everything not matched above) ────────
router.get("/:id", optionalAuth, getResourceById);
router.get("/:id/dashboard", authenticateRequest, getResourceDashboard);
router.patch("/:id/view", authenticateRequest, incrementViewCount);
router.put("/:id", authenticateRequest, updateResource);
router.patch("/:id/badge", authenticateRequest, updateResourceBadge);
router.delete("/:id", authenticateRequest, deleteResource);

export default router;
