import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { ServiceError } from "../errors/service.error.js";

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new ServiceError("Authentication required", 401);
    }
    // 1. Extract values with clear naming
    const currUserId = Number(user.sub); // From auth middleware
    const targetUserId = Number(req.params.id);
    const updateData = req.body;
    const file = req.file; // Provided by Multer

    // 2. Validate that they are actual numbers (prevents /update/abc crashing the app)
    if (isNaN(targetUserId) || isNaN(currUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format. IDs must be numeric.",
      });
    }

    // 2. Call service layer
    const updatedUser = await userService.updateUserService(
      targetUserId,
      currUserId,
      updateData,
      file as any // Casting if using Web File API vs Multer File
    );

    // 3. Return 200 OK (Standard for updates)
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
