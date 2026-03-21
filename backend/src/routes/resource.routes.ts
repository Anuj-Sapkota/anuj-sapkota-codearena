import { Router } from "express";
import {
  createSeries,
  deleteResource,
  getMyResources,
  getResourceById,
  updateResource,
  getPublicResources, // 👈 Add this import
} from "../controllers/resource.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const router = Router();

// 🔓 PUBLIC ROUTES (No login required)
// This must stay ABOVE the authenticateRequest line
router.get("/explore", getPublicResources);

// 🚀 PROTECTED ROUTES (Login required)
router.use(authenticateRequest);

router.post("/create-series", createSeries);
router.get("/my-resources", getMyResources);
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
