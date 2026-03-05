import { Router } from "express";
import { 
  createDiscussion, 
  getDiscussions, 
  toggleUpvote, 
  updateDiscussion, 
  deleteDiscussion 
} from "../controllers/discussion.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   GET /api/discussions/problem/:problemId
 * @desc    Get all top-level discussions for a specific problem
 */
router.get("/problem/:problemId", getDiscussions);

/**
 * @route   POST /api/discussions
 * @desc    Create a new discussion or reply (Protected)
 */
router.post("/", authenticateRequest, createDiscussion);

/**
 * @route   PATCH /api/discussions/:id
 * @desc    Update an existing discussion (Protected/Owner Only)
 */
router.patch("/:id", authenticateRequest, updateDiscussion);

/**
 * @route   DELETE /api/discussions/:id
 * @desc    Delete a discussion (Protected/Owner Only)
 */
router.delete("/:id", authenticateRequest, deleteDiscussion);

/**
 * @route   POST /api/discussions/:id/upvote
 * @desc    Toggle upvote/unvote on a discussion (Protected)
 */
router.post("/:id/upvote", authenticateRequest, toggleUpvote);

export default router;