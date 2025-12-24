import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const saltRound = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

//checking if secret exists
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;


if (!accessSecret || refreshSecret) {
  throw new Error("Missing JWT env variables");
}

const config = {
  // databaseUrl: process.env.DATABASE_URL || "",
  port: process.env.PORT || "5000",
  saltRound,

  jwt: {
    jwtSecret: accessSecret,
    jwtRefreshSecret: refreshSecret,
    jwtExpiresIn: 15 * 60, // 15 minutes
    jwtRefreshExpiresIn: 7 * 24 * 60 * 60, // 7 days
    
  },
};

export default config;
