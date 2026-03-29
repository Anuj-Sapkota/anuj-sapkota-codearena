import { Router } from "express";
import {
  createSeries,
  deleteResource,
  getMyResources,
  getResourceById,
  updateResource,
  getPublicResources,
  getCreatorStats,
  incrementViewCount, // 👈 Add this import
} from "../controllers/resource.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";
const router = Router();

// 🔓 PUBLIC ROUTES
router.get("/explore", authenticateRequest, getPublicResources);

// 🚀 PROTECTED ROUTES
router.use(authenticateRequest);

// 1. Specific Action Routes (Put these FIRST)
router.get("/creator/stats", getCreatorStats);
router.patch("/:id/view", incrementViewCount); // 👈 Move this above the GET /:id

// 2. Resource CRUD Routes
router.post("/create-series", createSeries);
router.get("/my-resources", getMyResources);

// 3. Generic ID Routes (Put these LAST)
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
