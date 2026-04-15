import { Router } from "express";
import { getLeaderboard, getProblemLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

router.get("/", getLeaderboard);
router.get("/problem/:problemId", getProblemLeaderboard);

export default router;
