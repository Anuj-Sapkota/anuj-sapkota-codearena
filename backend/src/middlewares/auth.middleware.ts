import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/service.error.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // look for cookie
    const cookies = req.cookies ?? {};
    const token = cookies.accessToken;

    // 2. If no cookie? -> unauthorized
    if (!token) {
      throw new ServiceError("Unauthorized: No session cookie found", 401);
    }

    // 3. Verify the token
    const decoded = verifyAccessToken(String(token));

    // 4. Attach user to request
    (req as any).user = decoded;

    next();
  } catch (err) {
    // If token is expired or invalid, verifyAccessToken will throw,
    next(err);
  }
};