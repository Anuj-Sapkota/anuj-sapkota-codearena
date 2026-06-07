// src/services/cloudinary.service.ts
import { uploadToCloudinary } from "../lib/cloudinary.js";
import type {UploadType} from "../lib/cloudinary.js"
import type { UploadApiResponse } from "cloudinary";

/**
 * Proper Service wrapper for Multer files
 * @param file - The file from req.file (Multer)
 * @param type - The preset type ('profile', 'thumbnail', or 'video')
 */
const uploadFile = async (
  file: Express.Multer.File,
  type: UploadType = "thumbnail"
): Promise<UploadApiResponse> => {
  if (!file.buffer) {
    throw new Error("No file buffer found. Ensure Multer memoryStorage is used.");
  }

  // We call our utility which already contains the compression/folder logic
  return await uploadToCloudinary(file.buffer, type);
};

export default uploadFile;