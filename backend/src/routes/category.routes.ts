import express from "express";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.middleware.js";
import {
  createCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", authenticateRequest, getCategories);
/**
 * @route   POST /api/categories/create
 * @desc    Create a new problem category
 * @access  Private (Admin Only)
 */
router.post(
  "/create",
  authenticateRequest,
  authorizeRequest("ADMIN"), // Gatekeeper: Only ADMIN role can pass
  createCategory,
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get details for a specific category
 * @access  Private (Authenticated Users)
 */
router.get("/:id", authenticateRequest, getCategoryById);

// New Routes
router.put("/update/:id", authenticateRequest, authorizeRequest("ADMIN"), updateCategory);
router.delete("/delete/:id", authenticateRequest, authorizeRequest("ADMIN"), deleteCategory);
export default router;
