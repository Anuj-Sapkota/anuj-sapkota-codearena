import { Router } from "express";
import {
  createProblem,
  getAllProblems,
  getSingleProblem,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";

const router = Router();

/**
 * @route   GET /api/problems
 * @desc    Fetch all problems (Explore page)
 * @access  Public
 */
router.get("/", getAllProblems);

/**
 * @route   GET /api/problems/:slug
 * @desc    Fetch a single problem by its slug (Problem details page)
 * @access  Public
 */
router.get("/:id", getSingleProblem);

/**
 * @route   POST /api/problems
 * @desc    Create a new problem with test cases and categories
 * @access  Private (Admin Only)
 */
router.post("/", authenticateRequest, authorizeRequest("ADMIN"), createProblem);

/**
 * @route   PUT /api/problems/:id
 * @desc    Update an existing problem and its test cases
 * @access  Private (Admin Only)
 */
router.put("/:id", authenticateRequest, authorizeRequest("ADMIN"), updateProblem);

/**
 * @route   DELETE /api/problems/:id
 * @desc    Remove a problem and its associated test cases from the registry
 * @access  Private (Admin Only)
 */
router.delete("/:id", authenticateRequest, authorizeRequest("ADMIN"), deleteProblem);

export default router;