import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { ServiceError } from "../errors/service.error.js";

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) throw new ServiceError("Authentication required", 401);

    const currUserId = Number(user.sub);
    const targetUserId = Number(req.params.id);

    if (isNaN(targetUserId) || isNaN(currUserId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format." });
    }

    const updatedUser = await userService.updateUserService(
      targetUserId, currUserId, req.body, req.file as any,
    );

    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) throw new ServiceError("Authentication required", 401);
    const userData = await userService.getUserByID(user.sub);
    return res.status(200).json({ data: userData });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const targetId = Number(userId);

  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const profile = await userService.getUserProfileService(targetId);
    return res.status(200).json({ success: true, ...profile });
  } catch (err: any) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};
