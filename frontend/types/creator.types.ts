export type ApplicationStatus = "NOT_APPLIED" | "PENDING" | "APPROVED" | "REJECTED";

export interface CreatorProfile {
  id: number;
  userId: number;
  bio: string | null;
  portfolioUrl: string | null;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorApplicationDTO {
  bio: string;
  portfolioUrl: string;
}

export interface VerifyOTPDTO {
  otp: string;
}

export interface AdminReviewDTO {
  targetUserId: number;
  status: "APPROVED" | "REJECTED";
}