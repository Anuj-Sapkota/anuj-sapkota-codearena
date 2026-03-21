// controllers/upload.controller.ts
import type { Request, Response } from "express";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import type { UploadType } from "../lib/cloudinary.js";

export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    const file = req.file; // Provided by multer
    const uploadType = (req.body.type as UploadType) || "thumbnail";

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Call the utility we just built
    const result = await uploadToCloudinary(file.buffer, uploadType);

    // Return the secure URL and other metadata to the frontend
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration || null, // Useful for videos
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error during upload" });
  }
};
