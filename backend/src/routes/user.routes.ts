import express from "express";
import multer from "multer";
import { updateUser, getUserById } from "../controllers/user.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js"; // Your middleware

const router = express.Router();

// 1. Configure Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
});

// 2. Apply to the specific route
router.patch(
  "/update/:id",
  authenticateRequest,
  upload.single("profile_pic"),
  updateUser,
);

router.get("/:id", authenticateRequest, getUserById)
export default router;
