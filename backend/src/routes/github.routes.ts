import express from "express";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import {
  getRepos,
  pushCode,
  getRepoContents,
  folderCreation,
} from "../controllers/github.controller.js";

const router = express.Router();

router.get("/repos", authenticateRequest, getRepos);

router.get(
  "/repos/:owner/:repo/contents",
  authenticateRequest,
  getRepoContents,
);

//Folder creation
router.post("/repos/create-folder", authenticateRequest, folderCreation);

router.post("/push", authenticateRequest, pushCode);

export default router;
