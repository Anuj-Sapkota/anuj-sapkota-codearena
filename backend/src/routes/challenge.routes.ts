import { Router } from "express";
import {
  createChallenge,
  getAllChallenges,
  getSingleChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challenge.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";

const router = Router();

/**
 * @route   GET /api/challenges
 * @desc    Fetch all challenges with pagination
 * @access  Public
 */
router.get("/", getAllChallenges);

/**
 * @route   POST /api/challenges
 * @desc    Create a new challenge
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
 * @desc    Update an existing challenge via Numeric ID
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
 * @desc    Remove a challenge via Numeric ID
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
 * @desc    Fetch a single challenge by its unique slug (for the UI)
 * @access  Public
 */
router.get("/:slug", getSingleChallenge);

export default router;