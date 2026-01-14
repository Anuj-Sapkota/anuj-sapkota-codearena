import type { Request, Response } from "express";
import authService from "../services/authService.js";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth.js";
import { ServiceError } from "../errors/ServiceError.js";
import config from "../configs/config.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendResetEmail } from "../services/mailService.js";

/**
 * PRIVATE HELPER to Standardize cookie setting across all auth methods
 */
const _setAuthCookies = (
  res: Response,
  userId: number,
  role: string,
  token?: string
) => {
  const accessToken = token || signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });

  res.cookie("accessToken", accessToken, {
    httpOnly: config.cookies.httpOnly,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    maxAge: config.cookies.accessMaxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: config.cookies.httpOnly,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    maxAge: config.cookies.refreshMaxAge,
  });
};

/**
 * PRIVATE HELPER to Standardize the error response format
 */
const _handleError = (res: Response, err: any) => {
  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected Error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
};

// --- CONTROLLER METHODS ---

const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  try {
    const data = await authService.register(req.body);
    _setAuthCookies(res, data.user.userId, data.user.role);
    res.status(201).json(data);
  } catch (err) {
    _handleError(res, err);
  }
};

const loginUser = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  try {
    const data = await authService.login(req.body);
    _setAuthCookies(res, data.user.userId, data.user.role);
    res.status(200).json(data);
  } catch (err) {
    _handleError(res, err);
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new ServiceError("No Refresh token found", 401);

    const payload = verifyRefreshToken(token);
    const data = await authService.getUserByUserID(Number(payload.sub));

    _setAuthCookies(res, data.user.userId, data.user.role);
    res.status(200).json(data);
  } catch (err) {
    _handleError(res, err);
  }
};

const logoutUser = (req: Request, res: Response) => {
  try {
    const options = {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      path: "/",
      expires: new Date(0), // Jan 1, 1970
      maxAge: 0,
    };

    res.cookie("accessToken", "", options);
    res.cookie("refreshToken", "", options);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    _handleError(res, err);
  }
};

const oauthSignIn = async (req: Request, res: Response) => {
  try {
    const userData = req.user as AuthUser;
    // Pass the existing token from OAuth instead of signing a new one
    _setAuthCookies(
      res,
      userData.user.userId,
      userData.user.role,
      userData.token
    );
    res.redirect(`${config.frontendUrl}/explore`);
  } catch (err) {
    _handleError(res, err);
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).sub;
    const result = await authService.getUserByUserID(userId);

    res.status(200).json({
      user: result.user,
      token:
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1],
    });
  } catch (err) {
    _handleError(res, err);
  }
};

const forgotPassword = async (req: Request, res: Response) => {
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
    _handleError(res, err);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.verifyAndResetPassword(String(token), password);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    _handleError(res, err);
  }
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
};
