import { prisma } from "../lib/prisma.js";
import uploadFile from "../lib/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
const forbiddenFields = ["password", "role", "createdBy", "email"];

export const updateUserService = async (
  userId: number,
  currUserId: number,
  data: any,
  file?: Express.Multer.File
) => {
  // 1. Fetch existing user
  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });

  if (!user) {
    throw { message: "User does not exist!", statusCode: 404 };
  }

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
      const publicId = user.profile_pic_url.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`codearena/profiles/${publicId}`);
      }
    }
    const filename = user.userId.toString();
    // B. Upload new file using your utility
    const uploadResult = await uploadFile(file, filename);
    profilePicUrl = uploadResult.secure_url;
  }

  // 5. Prisma Update
  const updatedUser = await prisma.user.update({
    where: { userId: userId },
    data: {
      full_name: data.fullName ?? user.full_name,
      bio: data.bio ?? user.bio,
      profile_pic_url: profilePicUrl,
    },

    //returning data except for password
    select: {
      userId: true,
      full_name: true,
      email: true,
      bio: true,
      profile_pic_url: true,
      role: true,
    },
  });

  return updatedUser;
};
