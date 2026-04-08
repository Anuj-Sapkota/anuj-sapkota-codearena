import type { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service.js";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth.js";
import { ServiceError } from "../errors/service.error.js";
import config from "../configs/config.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import { sendResetEmail } from "../services/mail.service.js";

/**
 * PRIVATE HELPER to Standardize cookie setting across all auth methods.
 * Only the refreshToken goes in an httpOnly cookie.
 * The accessToken is returned in the response body for the client to store in memory.
 */
const _setRefreshCookie = (res: Response, userId: number) => {
  const refreshToken = signRefreshToken({ sub: userId });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    maxAge: config.cookies.refreshMaxAge,
    path: "/",
  });

  return refreshToken;
};

const _clearAuthCookies = (res: Response) => {
  const options = {
    httpOnly: true,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };
  res.cookie("refreshToken", "", options);
  // Clear legacy accessToken cookie if present
  res.cookie("accessToken", "", options);
};

// --- CONTROLLER METHODS ---

const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await authService.register(req.body);
    _setRefreshCookie(res, data.user.userId);
    const accessToken = signAccessToken({ sub: data.user.userId, role: data.user.role });

    res.status(201).json({
      success: true,
      accessToken,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await authService.login(req.body);
    _setRefreshCookie(res, data.user.userId);
    const accessToken = signAccessToken({ sub: data.user.userId, role: data.user.role });

    res.status(200).json({
      success: true,
      accessToken,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new ServiceError("No refresh token found", 401);

    const payload = verifyRefreshToken(token);
    const data = await authService.getUserByUserID(Number(payload.sub));

    // Issue a fresh access token — return it in the body, not a cookie
    const accessToken = signAccessToken({ sub: data.user.userId, role: data.user.role });

    res.status(200).json({
      success: true,
      accessToken,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    _clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

const oauthSignIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.user as AuthUser;

    _setRefreshCookie(res, userData.user.userId);
    const accessToken = signAccessToken({ sub: userData.user.userId, role: userData.user.role });

    // Decode the state param to determine if this was an account-linking flow
    // (initiated from settings by an already-logged-in user) or a fresh login.
    const rawState = (req.query.state as string) || "";
    let isLinking = false;
    if (rawState) {
      try {
        const decoded = JSON.parse(Buffer.from(rawState, "base64").toString("utf-8"));
        isLinking = !!decoded.userId;
      } catch {
        // malformed state — treat as fresh login
      }
    }

    const redirectUrl = isLinking
      ? `${config.frontendUrl}/settings/accounts-security?status=success&token=${accessToken}`
      : userData.user.role === "ADMIN"
        ? `${config.frontendUrl}/admin?token=${accessToken}`
        : `${config.frontendUrl}/explore?token=${accessToken}`;

    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any).sub;
    const result = await authService.getUserByUserID(Number(userId));

    res.status(200).json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    const result = await authService.generateResetToken(email);

    if (result) {
      // Logic for sending email
      await sendResetEmail(result.userEmail, result.token);
      console.log(`Email sent successfully to ${result.userEmail}`);
    }

    res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.verifyAndResetPassword(String(token), password);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

// --- CONTROLLER: UNLINK ---
const unlinkOAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.body;
    const userId = (req.user as any).sub; // Extracted from JWT middleware

    await authService.unlinkProvider(userId, provider);
    res.status(200).json({ message: `Unlinked ${provider} successfully` });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const setInitialPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password } = req.body;
    const userId = (req.user as any).userId || (req.user as any).sub;

    if (!password || password.length < 8) {
      throw new ServiceError(
        "Password must be at least 8 characters long",
        400,
      );
    }

    await authService.setInitialPassword(Number(userId), password);

    res.status(200).json({
      success: true,
      message:
        "Password set successfully. You can now disconnect social accounts.",
    });
  } catch (err) {
    next(err);
  }
};
// --- CONTROLLER: DELETE ACCOUNT ---
const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password } = req.body;
    console.log("password:", password);
    const userId = (req.user as any).sub; // Or .sub depending on your JWT payload

    await authService.deleteUserAccount(Number(userId), password);

    _clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully.",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//---------- CHANGE PASSWORD -------

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user.sub; // Ensure this matches your JWT payload key

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new passwords are required." });
    }

    await authService.changeUserPassword(
      Number(userId),
      oldPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

import jwt from "jsonwebtoken";
import passport from "passport";

const initiateGithubAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Read the Bearer token from Authorization header (new flow)
    // or fall back to the legacy accessToken cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    let state: string | undefined = undefined;

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.jwtSecret) as any;
        state = Buffer.from(JSON.stringify({ userId: decoded.sub })).toString("base64");
      } catch {
        state = undefined;
      }
    }

    passport.authenticate("github", {
      session: false,
      scope: ["user:email", "repo"],
      state,
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

const initiateGoogleAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  let state: string | undefined = undefined;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.jwtSecret) as any;
      state = Buffer.from(JSON.stringify({ userId: decoded.sub })).toString("base64");
    } catch {
      state = undefined;
    }
  }

  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    state,
  })(req, res, next);
};
export default {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  oauthSignIn,
  getMe,
  resetPassword,
  forgotPassword,
  unlinkOAuth,
  deleteAccount,
  setInitialPassword,
  changePassword,
  initiateGithubAuth,
  initiateGoogleAuth,
};
