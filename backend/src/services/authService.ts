import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import { generateUsername } from "../utils/username.js";
import type {
  AuthUser,
  RegisterInput,
  LoginInput,
  UserProfile,
} from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ServiceError } from "../errors/ServiceError.js";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../constants/passwordLimit.js";
import { signAccessToken } from "../utils/jwt.js";

/**
 * Helper to format the standard user response object for consistency
 */
const formatAuthResponse = (user: any): AuthUser => {
  const accessToken = signAccessToken({
    sub: user.userId,
    role: user.role,
  });

  return {
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      bio: user.bio,
      profile_pic_url: user?.profile_pic_url,
      email: user.email,
      role: user.role,
      total_points: user.total_points,
    },
    token: accessToken,
  };
};

// --- USER REGISTRATION ---
const register = async ({
  full_name,
  email,
  password,
}: RegisterInput): Promise<AuthUser> => {
  if (!full_name || !email || !password) {
    throw new ServiceError("Missing required fields", 400);
  }

  const generatedUsername = generateUsername(full_name);

  const userExists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: generatedUsername }] },
  });

  if (userExists) {
    throw new ServiceError("User already exists!", 409);
  }

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new ServiceError(
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
      400
    );
  }

  const user = await prisma.user.create({
    data: {
      full_name,
      username: generatedUsername,
      email,
      password_hash: await hashPassword(password),
    },
  });

  return formatAuthResponse(user);
};

// --- USER LOGIN ---
const login = async ({
  emailOrUsername,
  password,
}: LoginInput): Promise<AuthUser> => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });

  if (!user) {
    throw new ServiceError("Incorrect Email or Password.", 401);
  }

  if (!user.password_hash) {
    throw new ServiceError(
      "This account is registered via OAuth. Please sign in with Google/GitHub.",
      401
    );
  }

  const isPasswordCorrect = await verifyPassword(password, user.password_hash);
  if (!isPasswordCorrect) {
    throw new ServiceError("Incorrect Email or Password.", 401);
  }

  return formatAuthResponse(user);
};

// --- GET USER PROFILE ---
const getUserByUserID = async (userId: number): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User not found", 404);

  return {
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      total_points: user.total_points,
    },
  };
};

// --- OAUTH FLOW ---
const findOrCreateOAuthUser = async (profile: any, provider: string): Promise<AuthUser> => {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new ServiceError("Email not found in OAuth profile", 400);

  const fullName = provider === "google" ? profile.displayName || email.split("@")[0] : profile.username;
  const username = generateUsername(fullName);

  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        full_name: fullName,
        username,
        email,
        auth_provider: provider,
        google_id: profile.id,
      },
    });
  }

  return formatAuthResponse(user);
};

// --- PASSWORD RECOVERY: GENERATE TOKEN ---
const generateResetToken = async (email: string): Promise<{ token: string; userEmail: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Security
  if (!user) {
     throw new ServiceError("If an account exists, a reset link has been sent.", 200);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      resetToken: token,
      resetTokenExp: expiry,
    },
  });

  return { token, userEmail: user.email };
};

// --- PASSWORD RECOVERY: RESET ACTION ---
const verifyAndResetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ServiceError("Invalid or expired reset token.", 400);
  }

  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      password_hash: await hashPassword(newPassword),
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return true;
};

export default {
  register,
  login,
  getUserByUserID,
  findOrCreateOAuthUser,
  generateResetToken,
  verifyAndResetPassword,
};