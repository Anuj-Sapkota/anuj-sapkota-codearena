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
import { authenticateRequest } from "../middleware/auth.middleware.js";
const router = Router();

// 🔓 PUBLIC ROUTES
router.get("/explore", authenticateRequest, getPublicResources);

// 🚀 PROTECTED ROUTES
router.use(authenticateRequest);

// 1. Specific Action Routes (Put these FIRST)
router.get("/creator/stats", getCreatorStats);
router.patch("/:id/view", incrementViewCount);
router.post("/complete-module", completeModule);
router.get("/:id/dashboard", getResourceDashboard);

// Assignment routes
router.put("/:resourceId/assignment", saveAssignment);
router.get("/:resourceId/assignment", getAssignment);
router.post("/assignment/:assignmentId/submit", submitAssignment);

// 2. Resource CRUD Routes
router.post("/create-series", createSeries);
router.get("/my-resources", getMyResources);

// 3. Generic ID Routes (Put these LAST)
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.patch("/:id/badge", updateResourceBadge);
router.delete("/:id", deleteResource);

export default router;
