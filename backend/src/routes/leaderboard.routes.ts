import { Router } from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateRequest);
router.get("/", getLeaderboard);

export default router;
