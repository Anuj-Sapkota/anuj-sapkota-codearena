import { Router } from "express";
import {
  createChallenge,
  getAllChallenges,
  getSingleChallenge,
  updateChallenge,
  deleteChallenge,
  getPublicChallenge,
} from "../controllers/challenge.controller.js";
import { authenticateRequest, optionalAuth } from "../middleware/auth.middleware.js";
import { authorizeRequest } from "../middleware/authorize.middleware.js";

const router = Router();

/**
 * @route   GET /api/challenges/public
 * @desc    Fetch active/live challenges for the user homepage
 * @access  Public
 * @note    Placed above /:slug to prevent "public" being treated as a slug parameter.
 */
router.get("/public", getPublicChallenge);

/**
 * @route   GET /api/challenges
 * @desc    Fetch all challenges with pagination (Administrative list)
 * @access  Private (Admin Only)
 */
router.get(
  "/", 
  authenticateRequest, 
  authorizeRequest("ADMIN"), 
  getAllChallenges
);

/**
 * @route   POST /api/challenges
 * @desc    Create a new challenge and link problems
 * @access  Private (Admin Only)
 */
router.post(
  "/",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  createChallenge,
);

/**
 * @route   PATCH /api/challenges/:challengeId
 * @desc    Update challenge details and re-sync problem list via Numeric ID
 * @access  Private (Admin Only)
 */
router.patch(
  "/:challengeId",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  updateChallenge,
);

/**
 * @route   DELETE /api/challenges/:challengeId
 * @desc    Permanently remove a challenge and its problem links
 * @access  Private (Admin Only)
 */
router.delete(
  "/:challengeId",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  deleteChallenge,
);

/**
 * @route   GET /api/challenges/:slug
 * @desc    Fetch detailed challenge data, including user-specific problem status
 * @access  Public (optionalAuth — guests see challenge but no progress)
 * @note    Dynamic parameter routes should always be placed at the end of the file.
 */
router.get("/:slug", optionalAuth, getSingleChallenge);

export default router;