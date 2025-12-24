import * as jwt from "jsonwebtoken";
import config from "../configs/config.js";
import { ServiceError } from "../errors/ServiceError.js";

//sign the access token
export const signAccessToken = (payload: { sub: number; role: string }) => {
  return jwt.sign(payload, config.jwt.jwtSecret, {
    expiresIn: config.jwt.jwtExpiresIn,
  });
};

//verify
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.jwtSecret);
  } catch {
    throw new ServiceError("Invalid or Expired token", 401);
  }
};
