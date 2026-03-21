import { v2 as cloudinary } from "cloudinary";

export type UploadType = "profile" | "thumbnail" | "video";

/**
 * Centrally managed upload utility
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  type: UploadType = "thumbnail",
): Promise<any> => {
  // 1. Base Options
  const options: any = {
    folder: `codeArena/${type}s`,
    resource_type: "auto",
    // Allows Cloudinary to optimize the delivery based on the viewer's browser
    fetch_format: "auto",
    quality: "auto",
  };

  // 2. Type-Specific Logic
  switch (type) {
    case "video":
      options.resource_type = "video";
      options.transformation = [
        { quality: "auto:eco", fetch_format: "mp4" }, // 'eco' saves even more bandwidth
        { width: 1280, height: 720, crop: "limit" }, // Ensures no 4K uploads eat your storage
      ];
      break;

    case "profile":
      options.transformation = [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
      ];
      break;

    case "thumbnail":
      options.transformation = [{ width: 1280, height: 720, crop: "fill" }];
      break;
  }

  // 3. Execution
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });
};
