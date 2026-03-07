import { Router } from "express";
import { 
  createDiscussion, 
  getDiscussions, 
  toggleUpvote, 
  updateDiscussion, 
  deleteDiscussion,
  reportDiscussion,    
  moderateDiscussion,  
  getFlaggedDiscussions
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
 * @desc    Delete a discussion (Protected/Owner/Admin Only)
 */
router.delete("/:id", authenticateRequest, deleteDiscussion);

/**
 * @route   POST /api/discussions/:id/upvote
 * @desc    Toggle upvote/unvote on a discussion (Protected)
 */
router.post("/:id/upvote", authenticateRequest, toggleUpvote);

/**
 * @route   POST /api/discussions/:id/report
 * @desc    Report a discussion for violation (Protected)
 */
router.post("/:id/report", authenticateRequest, reportDiscussion);

/**
 * @route   PATCH /api/discussions/:id/moderate
 * @desc    Block or Unblock a discussion (Admin Only)
 */
router.patch("/:id/moderate", authenticateRequest, moderateDiscussion);

/**
 * @route   GET /api/discussions/reports/flagged
 * @desc    Fetch all discussions with high report counts
 */
router.get("/reports/flagged", authenticateRequest, getFlaggedDiscussions);
  
export default router;