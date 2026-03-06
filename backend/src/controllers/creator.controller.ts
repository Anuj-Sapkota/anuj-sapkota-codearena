import type { Request, Response, NextFunction } from "express";
import { 
  applyToBecomeCreatorService, 
  verifyCreatorOTPService, 
  adminReviewCreatorService 
} from "../services/creator.service.js";
import { ServiceError } from "../errors/service.error.js";

export const applyForCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub;
    console.log("This is from creator controller: ", userId)
    // if (!userId) throw new ServiceError("Unauthorized", 401);

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

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub;
    const { otp } = req.body;

    if (!otp) throw new ServiceError("OTP is required", 400);

    await verifyCreatorOTPService(Number(userId), otp);

    res.status(200).json({
      success: true,
      message: "Email verification successful. Application is now with Admin for review.",
    });
  } catch (err) {
    next(err);
  }
};

export const updateCreatorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId, status } = req.body; // status: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new ServiceError("Invalid status action", 400);
    }

    await adminReviewCreatorService(Number(targetUserId), status);

    res.status(200).json({
      success: true,
      message: `User has been ${status.toLowerCase()} as a creator.`,
    });
  } catch (err) {
    next(err);
  }
};