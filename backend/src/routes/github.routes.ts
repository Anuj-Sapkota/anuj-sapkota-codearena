import express from "express";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { getRepos } from "../controllers/github.controller.js";

const router = express.Router();

router.get("/repos", authenticateRequest, getRepos);

export default router;
