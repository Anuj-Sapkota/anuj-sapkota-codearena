import type { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { ServiceError } from "../errors/ServiceError.js";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new ServiceError("Authentication required", 401);
    }
    // 1. Extract values with clear naming
    const currUserId = Number(user.sub); // From auth middleware
    const targetUserId = Number(req.params.id);
    const updateData = req.body;
    console.log("This is updatedData", updateData);
    const file = req.file; // Provided by Multer

    // 2. Validate that they are actual numbers (prevents /update/abc crashing the app)
    if (isNaN(targetUserId) || isNaN(currUserId)) {
      console.log("DEBUG -> Params ID:", req.params.id);
      console.log("DEBUG -> User Object:", (req as any).user.sub);
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
  } catch (error: any) {
    // 4. Smart Error Handling
    // If the error has a status code (like the 403/404 we defined in the service), use it
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error(`[UpdateUser Error]: ${message}`);

    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};
