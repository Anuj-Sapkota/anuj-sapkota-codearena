import { prisma } from "../lib/prisma.js";
import uploadFile from "./cloudinary.service.js";
import { v2 as cloudinary } from "cloudinary";
import { ServiceError } from "../errors/service.error.js";
import type { AuthUser } from "../types/auth.js";
import formatAuthResponse from "../helper/format-auth-response.helper.js";

const forbiddenFields = ["password", "role", "createdBy", "email"];

/**
 * -------------- UPDATE USER SERVICE -----------------
 */
export const updateUserService = async (
  userId: number,
  currUserId: number,
  data: any,
  file?: Express.Multer.File,
) => {
  // 1. Fetch existing user
  const user = await findUserRaw(userId);

  // 2. Authorization Check
  if (userId !== currUserId) {
    throw { message: "Unauthorized!", statusCode: 403 };
  }

  // 3. Forbidden Fields Check
  for (let field of forbiddenFields) {
    if (field in data) {
      throw { message: `Cannot Update ${field}`, statusCode: 403 };
    }
  }

  // 4. Image Management
  let profilePicUrl = user.profile_pic_url;

  if (file && file.size > 0) {
    // A. Delete old file from Cloudinary if it exists
    if (user.profile_pic_url) {
      try {
        const urlParts = user.profile_pic_url.split("/");
        const fileNameWithExtension = urlParts.pop(); // Safely get last element

        if (fileNameWithExtension) {
          const publicId = fileNameWithExtension.split(".")[0];
          
          // Cloudinary destroy requires the folder path if the file is in one
          // We target the 'profiles' folder specifically
          await cloudinary.uploader.destroy(`profiles/${publicId}`);
        }
      } catch (err) {
        // We log but don't throw, so a missing old file doesn't block a new upload
        console.error("Cloudinary Delete Error (Non-fatal):", err);
      }
    }

    // B. Upload new file using our central service
    // "profile" type triggers the 400x400 face-detection crop defined in lib/cloudinary
    const uploadResult = await uploadFile(file, "profile");
    profilePicUrl = uploadResult.secure_url;
  }

  // 5. Prisma Update
  const updatedUser = await prisma.user.update({
    where: { userId: userId },
    data: {
      full_name: data.full_name ?? user.full_name,
      bio: data.bio ?? user.bio,
      profile_pic_url: profilePicUrl,
    },
  });

  return formatAuthResponse(updatedUser);
};

/**
 * -------------- GET USER BY ID -----------------
 */
export const getUserByID = async (userId: number): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });
  if (!user) {
    throw new ServiceError("User does not exist!", 404);
  }
  return formatAuthResponse(user);
};

/**
 * ----------- GET RAW USER DETAILS FROM ID -----------
 * Internal helper for other services
 */
export const findUserRaw = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User does not exist!", 404);
  return user;
};

