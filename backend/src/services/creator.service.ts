import { ServiceError } from "../errors/service.error.js";
import { prisma } from "../lib/prisma.js";
import { sendVerificationEmail } from "./mail.service.js";

export const applyToBecomeCreatorService = async (userId: number, data: any) => {
  const { bio, portfolioUrl, githubUrl } = data; // Added githubUrl from your form

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User not found", 404);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

  return await prisma.$transaction(async (tx) => {
    // 1. Create or Update the Profile (Keep status as NOT_APPLIED until OTP is verified)
    const profile = await tx.creatorProfile.upsert({
      where: { userId },
      update: {
        bio,
        portfolioUrl,
        githubUrl, // Ensure this exists in your model
        otpCode: otp,
        otpExpiresAt: expiry,
        isEmailVerified: false,
        status: "NOT_APPLIED", 
      },
      create: {
        userId,
        bio,
        portfolioUrl,
        githubUrl,
        otpCode: otp,
        otpExpiresAt: expiry,
        status: "NOT_APPLIED",
      },
    });

    // 2. We keep the User status as NOT_APPLIED until they finish OTP
    await tx.user.update({
      where: { userId },
      data: { creatorStatus: "NOT_APPLIED" },
    });

    await sendVerificationEmail(user.email, otp);
    return profile;
  });
};

export const verifyCreatorOTPService = async (userId: number, otp: string) => {
  const profile = await prisma.creatorProfile.findUnique({ where: { userId } });

  if (!profile || profile.otpCode !== otp) {
    throw new ServiceError("Invalid verification code", 400);
  }

  if (profile.otpExpiresAt && new Date() > profile.otpExpiresAt) {
    throw new ServiceError("Verification code has expired", 400);
  }

  // 🚀 THE FIX: Sync both User and Profile to PENDING
  return await prisma.$transaction(async (tx) => {
    // Update Profile
    await tx.creatorProfile.update({
      where: { userId },
      data: { 
        isEmailVerified: true, 
        otpCode: null, 
        otpExpiresAt: null,
        status: "PENDING" // Update Profile Enum
      },
    });

    // Update User (This is what Redux Persist sees on refresh)
    return await tx.user.update({
      where: { userId },
      data: { creatorStatus: "PENDING" }, // Update User Enum
      include: { creatorProfile: true }
    });
  });
};

export const adminReviewCreatorService = async (
  userId: number,
  status: "APPROVED" | "REJECTED",
  reason?: string,
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Update the User's Status and Role
    const user = await tx.user.update({
      where: { userId },
      data: {
        creatorStatus: status,
        role: status === "APPROVED" ? "CREATOR" : "USER",
      },
    });

    // 2. Update the Profile Status and Reason
    await tx.creatorProfile.update({
      where: { userId },
      data: {
        status: status, // Keep the enums in sync
        rejectionReason: status === "REJECTED" ? reason : null,
      },
    });

    return user;
  });
};

export const getPendingApplicationsService = async () => {
  return await prisma.user.findMany({
    where: {
      creatorStatus: "PENDING",
    },
    include: {
      creatorProfile: true, // This includes the bio, portfolioUrl, and githubUrl
    },
    orderBy: {
      updated_at: "desc", // Show the most recent applications first
    },
  });
};