import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/service.error.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Prefer Authorization: Bearer header (standard, sent by frontend axios)
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      // 2. Fallback: legacy cookie (OAuth redirect flows)
      token = req.cookies?.accessToken;
    }

    if (!token) {
      throw new ServiceError("Unauthorized: No token provided", 401);
    }

    const decoded = verifyAccessToken(String(token));
    (req as any).user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};
