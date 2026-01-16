import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import { generateUsername } from "../utils/username.util.js";
import type { AuthUser, RegisterInput, LoginInput } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import { ServiceError } from "../errors/service.error.js";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../constants/password.constants.js";

/**
 * Helper to format the standard user response object for consistency
 */
const formatAuthResponse = (user: any): { user: AuthUser["user"] } => {
  return {
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      bio: user.bio,
      profile_pic_url: user?.profile_pic_url,
      email: user.email,
      role: user.role,
      has_password: user.has_password,
      total_points: user.total_points,
      google_id: user.google_id,
      github_id: user.github_id,
    },
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

  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
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
const getUserByUserID = async (userId: number): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User not found", 404);

  return formatAuthResponse(user);
};
// --- OAUTH FLOW ---
const findOrCreateOAuthUser = async (
  profile: any,
  provider: string,
  currentUser?: any
): Promise<AuthUser> => {
  const email = profile.emails?.[0]?.value;
  const socialId = profile.id;
  const profilePic = profile.photos?.[0]?.value || null;

  // Key Fix: Determine exactly which database column we are dealing with
  const providerField = provider === "google" ? "google_id" : "github_id";

  // 1. SCENARIO: ACCOUNT LINKING (User is already logged in)
  if (currentUser) {
    // Extract ID based on how your middleware/Passport stores the user object
    const userId =
      currentUser.userId || currentUser.user?.userId || currentUser.sub;

    const updatedUser = await prisma.user.update({
      where: { userId: Number(userId) },
      data: {
        [providerField]: socialId, // Fixed: Only updates the specific provider column
        profile_pic_url: currentUser.profile_pic_url || profilePic,
      },
    });
    return formatAuthResponse(updatedUser);
  }

  // 2. SCENARIO: LOGIN (Check if THIS specific Social ID is already linked)
  let user = await prisma.user.findFirst({
    where: {
      [providerField]: socialId, // Fixed: Removed the OR bug. Now Google only checks google_id.
    },
  });

  if (user) return formatAuthResponse(user);

  // 3. SCENARIO: AUTO-LINKING (Check if email exists but social ID doesn't)
  if (!email) throw new ServiceError("Email not found in OAuth profile", 400);

  user = await prisma.user.findFirst({ where: { email } });

  if (user) {
    user = await prisma.user.update({
      where: { userId: user.userId },
      data: {
        [providerField]: socialId, // Fixed: Dynamic column update
      },
    });
    return formatAuthResponse(user);
  }

  // 4. SCENARIO: NEW USER (Registration)
  const fullName =
    provider === "google" ? profile.displayName : profile.username;
  const username = generateUsername(fullName || email.split("@")[0]);

  user = await prisma.user.create({
    data: {
      full_name: fullName || "User",
      username,
      email,
      auth_provider: provider,
      [providerField]: socialId, // Fixed: Saves to the correct column on creation
      profile_pic_url: profilePic,
      bio: "",
    },
  });

  return formatAuthResponse(user);
};
// --- UNLINK OAUTH ---
const unlinkProvider = async (
  userId: number,
  provider: "google" | "github"
) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) throw new ServiceError("User not found", 404);

  const hasPassword = !!user.password_hash;
  const hasOtherOAuth =
    provider === "google" ? !!user.github_id : !!user.google_id;

  if (!hasPassword && !hasOtherOAuth) {
    throw new ServiceError(
      "Cannot unlink your only login method. Set a password first.",
      400
    );
  }

  // Determine what the new auth_provider value should be
  let newAuthProvider = user.auth_provider;

  if (hasPassword) {
    // If they have a password, they can function as a "normal" user
    newAuthProvider = null;
  } else if (hasOtherOAuth) {
    // If no password, they must be identified by the REMAINING provider
    newAuthProvider = provider === "google" ? "github" : "google";
  }

  return await prisma.user.update({
    where: { userId },
    data: {
      [provider === "google" ? "google_id" : "github_id"]: null,
      auth_provider: newAuthProvider,
    },
  });
};
// --- DELETE USER ---
const deleteUserAccount = async (userId: number, password?: string) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  // 2. Security Check: If user has a password set, verify it
  if (user.password_hash) {
    if (!password) {
      throw new ServiceError("Password is required to delete account", 400);
    }

    const isMatch = await verifyPassword(password, user.password_hash);

    if (!isMatch) {
      throw new ServiceError("Incorrect password. Deletion aborted.", 401);
    }
  }

  // 3. Perform Deletion
  return await prisma.user.delete({
    where: { userId },
  });
};

const setInitialPassword = async (userId: number, newPassword: string) => {
  return await prisma.user.update({
    where: { userId },
    data: {
      password_hash: await hashPassword(newPassword),
      has_password: true,
    },
  });
};

// --- PASSWORD RECOVERY: GENERATE TOKEN ---
const generateResetToken = async (
  email: string
): Promise<{ token: string; userEmail: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Security
  if (!user) {
    throw new ServiceError(
      "If an account exists, a reset link has been sent.",
      200
    );
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
const verifyAndResetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
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

const changeUserPassword = async (
  userId: number,
  oldPass: string,
  newPass: string
) => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user || !user.password_hash) {
    throw new ServiceError("User not found or no password set to change.", 404);
  }

  // 2. Verify if the "Current Password" provided matches the DB
  const isMatch = await verifyPassword(oldPass, user.password_hash);

  if (!isMatch) {
    throw new ServiceError(
      "The current password you entered is incorrect.",
      401
    );
  }

  return await prisma.user.update({
    where: { userId },
    data: {
      password_hash: await hashPassword(newPass),
      has_password: true,
    },
  });
};

export default {
  register,
  login,
  getUserByUserID,
  findOrCreateOAuthUser,
  generateResetToken,
  verifyAndResetPassword,
  unlinkProvider,
  deleteUserAccount,
  setInitialPassword,
  changeUserPassword,
};
