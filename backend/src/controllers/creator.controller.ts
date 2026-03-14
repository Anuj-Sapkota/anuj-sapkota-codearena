import type { Request, Response, NextFunction } from "express";
import {
  applyToBecomeCreatorService,
  verifyCreatorOTPService,
  adminReviewCreatorService,
  getPendingApplicationsService,
} from "../services/creator.service.js";
import { ServiceError } from "../errors/service.error.js";

// 1. User Application
export const applyForCreator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.sub;
    const profile = await applyToBecomeCreatorService(Number(userId), req.body);

    res.status(200).json({
      success: true,
      message: "Application submitted. Check your email for the OTP.",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// 2. OTP Verification
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.sub; // or however you get ID
    console.log("Fom the cretor controller: ", userId)
    const { otp } = req.body;
    
    const updatedUser = await verifyCreatorOTPService(Number(userId), otp);
    
    // 🚨 VERY IMPORTANT: Return the updated user so the Frontend Auth slice 
    // can update the persisted state!
    res.status(200).json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (err) {
    next(err);
  }
};
// 3. Admin: Fetch all pending applications
export const getAllPendingCreators = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await getPendingApplicationsService();
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Admin: Approve or Reject an application (REPLACED DUPLICATES)
export const approveOrRejectCreator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { targetUserId, status, reason } = req.body; 

    if (!targetUserId || !status) {
      throw new ServiceError("User ID and status are required", 400);
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      throw new ServiceError("Invalid status. Must be APPROVED or REJECTED", 400);
    }

    const updatedUser = await adminReviewCreatorService(
      Number(targetUserId),
      status,
      reason
    );

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.username} has been ${status.toLowerCase()}.`,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};