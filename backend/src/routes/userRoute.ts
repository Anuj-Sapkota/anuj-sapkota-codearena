import express from "express";
import multer from "multer";
import { updateUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; // Your middleware

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
  authenticate,
  upload.single("profile_pic"),
  updateUser
);

export default router;
