import dotenv from "dotenv";

dotenv.config();

const saltRound = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

//checking if secret exists
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
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

  cookies: {
    accessMaxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE),
    refreshMaxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE as "strict" | "lax" | "none",
    httpOnly: process.env.COOKIE_HTTPONLY === "true",
  },

  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },

  github: {
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL!,
}
};

export default config;
