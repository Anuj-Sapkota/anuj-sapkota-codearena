import express from "express";
import { authenticateRequest } from "../middleware/auth.middleware.js";
import { authorizeRequest } from "../middleware/authorize.middleware.js";
import {
  createCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
/**
 * @route   POST /api/categories/create
 * @desc    Create a new problem category
 * @access  Private (Admin Only)
 */
router.post(
  "/",
  authenticateRequest,
  authorizeRequest("ADMIN"),
  createCategory,
);

router.get("/:id", authenticateRequest, getCategoryById);

router.put("/:id", authenticateRequest, authorizeRequest("ADMIN"), updateCategory);
router.delete("/:id", authenticateRequest, authorizeRequest("ADMIN"), deleteCategory);
export default router;
