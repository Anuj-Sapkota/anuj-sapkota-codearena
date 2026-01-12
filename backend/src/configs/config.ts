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
  port: Number(process.env.PORT),
  saltRound,
  frontendUrl: process.env.FRONTEND_URL,

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
  },
  turnstile: {
    secret: process.env.SECRET_KEY!,
    site_key: process.env.SITE_KEY!,
  },
  resetLink: {
    emailHost: process.env.EMAIL_HOST!,
    emailPort: process.env.EMAIL_PORT!,
    emailUser: process.env.EMAIL_USER!,
    emailPassword: process.env.EMAIL_PASS!,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
};

export default config;
