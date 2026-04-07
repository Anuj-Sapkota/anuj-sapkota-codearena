import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/service.error.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      // Fallback: legacy cookie (OAuth redirect flows)
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

/**
 * Optional auth — attaches user to req if a valid token is present,
 * but does NOT block the request if there is no token.
 * Use for public pages that show extra info when logged in (e.g. isOwned).
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies?.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(String(token));
        (req as any).user = decoded;
      } catch {
        // Invalid token — treat as guest, don't block
      }
    }
  } catch {
    // Ignore all errors — guest access is fine
  }
  next();
};
