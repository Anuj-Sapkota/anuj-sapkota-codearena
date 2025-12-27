import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/ServiceError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookies = req.cookies ?? {};
    let token = cookies.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new ServiceError("Unauthorized", 401);
      }
      token = authHeader.split(" ")[1];
    }

    const decoded = verifyAccessToken(String(token));

    (req as any).user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};
