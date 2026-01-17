// src/middlewares/error.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/service.error.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Log unknown errors for debugging
  console.error("[Server Error]:", err);

  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
};
