import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/ServiceError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   let token = req.cookies?.accessToken;
if (!token) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ServiceError("Unauthorized", 401);
  }
  token = authHeader.split(" ")[1];
}
    const decoded = verifyAccessToken(String(token));

    req.user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};
