import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

const CLOUDINARY_FOLDER = "codeArena";

// Use Express.Multer.File for the file type
const uploadFile = async (
  file: Express.Multer.File,
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: filename!,
          overwrite: true,
          resource_type: "auto", // Automatically detects if it's an image or video
        },
        (error, data) => {
          if (error) return reject(error);
          if (!data) return reject(new Error("Cloudinary upload failed"));
          resolve(data);
        }
      )
      .end(file.buffer); // Multer memoryStorage provides this buffer
  });
};

export default uploadFile;
