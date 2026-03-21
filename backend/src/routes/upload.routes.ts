// routes/upload.routes.ts
import express from "express";
import multer from "multer";
import { handleFileUpload } from "../controllers/upload.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js"; // Your existing auth logic

const router = express.Router();

// Configure Multer to use memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit to 100MB for example
});

// The endpoint
router.post("/", authenticateRequest, upload.single("file"), handleFileUpload);


export default router;
