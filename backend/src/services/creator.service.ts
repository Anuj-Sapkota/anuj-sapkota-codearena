import { ServiceError } from "../errors/service.error.js";
import { prisma } from "../lib/prisma.js";
import { sendVerificationEmail } from "./mail.service.js";
export const applyToBecomeCreatorService = async (userId: number, data: any) => {
  const { bio, portfolioUrl } = data;

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User not found", 404);

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

  return await prisma.$transaction(async (tx) => {
    // Correct property name is creatorProfile
    const profile = await tx.creatorProfile.upsert({
      where: { userId },
      update: { 
        bio, 
        portfolioUrl, 
        otpCode: otp, 
        otpExpiresAt: expiry,
        isEmailVerified: false // Reset verification if they re-apply
      },
      create: { 
        userId, 
        bio, 
        portfolioUrl, 
        otpCode: otp, 
        otpExpiresAt: expiry 
      },
    });

    await tx.user.update({
      where: { userId },
      data: { creatorStatus: "PENDING" },
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

  return await prisma.creatorProfile.update({
    where: { userId },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });
};

export const adminReviewCreatorService = async (userId: number, status: "APPROVED" | "REJECTED") => {
  return await prisma.user.update({
    where: { userId },
    data: {
      creatorStatus: status,
      role: status === "APPROVED" ? "CREATOR" : "USER",
    },
  });
};