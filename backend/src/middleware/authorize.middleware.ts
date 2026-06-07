import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ServiceError } from "../errors/service.error.js";
import type { AuthRequest } from "../types/auth.js";

// Explicitly type the return as RequestHandler
export const authorizeRequest = (...allowedRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. The Double Cast: unknown then AuthRequest
    const authReq = req as unknown as AuthRequest;
    const user = authReq.user;

    if (!user) {
      return next(new ServiceError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ServiceError("Forbidden: Insufficient permissions", 403));
    }

    next();
  };
};
