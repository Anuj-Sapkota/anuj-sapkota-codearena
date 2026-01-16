import { ServiceError } from "../errors/service.error.js";
import type { AuthRequest } from "../types/auth.js";
import type { NextFunction, Response } from "express";

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ServiceError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ServiceError("Forbidden: Insufficient permissions", 403));
    }

    next(); 
  };
};
