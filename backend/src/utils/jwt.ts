import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import { ServiceError } from "../errors/ServiceError.js";
import type { AccessTokenPayload } from "../types/auth.js";

const { sign, verify } = jwt;

//sign the access token
export const signAccessToken = (payload: AccessTokenPayload) => {
  try {
    const token = sign(payload, config.jwt.jwtSecret, {
      expiresIn: config.jwt.jwtExpiresIn,
    });

    return token;
  } catch (err) {
    console.error("ERROR while signing access token:", err);
    throw err;
  }
};

//verify
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = verify(token, config.jwt.jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("sub" in decoded) ||
      !("role" in decoded)
    ) {
      throw new ServiceError("Invalid token payload", 401);
    }

    return {
      sub: Number(decoded.sub),
      role: String(decoded.role),
    };
  } catch {
    throw new ServiceError("Invalid or Expired token", 401);
  }
};

// =====================FOR REFRESH TOKEN================================

export const signRefreshToken = (payload: { sub: number }) => {
  try {
    const refreshTOken = sign(payload, config.jwt.jwtRefreshSecret, {
      expiresIn: config.jwt.jwtRefreshExpiresIn,
    });
    return refreshTOken;
  } catch (err) {
    console.log("Error signing refresh token:", err);
  }
};

// verify refresh token

export const verifyRefreshToken = (token: string): { sub: number } => {
  try {
    const decoded = verify(token, config.jwt.jwtRefreshSecret);
    // if token doesnt exists, or isn't an object or doesn't contain sub
    if (typeof decoded != "object" || decoded === null || !("sub" in decoded)) {
      throw new ServiceError("Invalid refresh token", 401);
    }
    return { sub: Number(decoded.sub) };
  } catch (err) {
    throw new ServiceError("Invalid or expired refresh token", 401);
  }
};
