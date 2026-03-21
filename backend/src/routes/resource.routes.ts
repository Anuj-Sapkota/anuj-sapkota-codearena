import { Router } from "express";
import {
  createSeries,
  getMyResources,
  getResourceById,
} from "../controllers/resource.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js"; // Your auth guard

const router = Router();

// This makes the full path: /api/resources/create-series
router.post("/create-series", authenticateRequest, createSeries);

router.get("/my-resources", authenticateRequest, getMyResources);

// backend/routes/resource.routes.ts
router.get("/:id", getResourceById);
export default router;
