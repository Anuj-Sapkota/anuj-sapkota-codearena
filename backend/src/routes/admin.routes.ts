import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateRequest);

router.get("/stats", getAdminStats);

export default router;
