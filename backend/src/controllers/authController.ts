import type { Request, Response } from "express";

import authService from "../services/authService.js";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth.js";
import { ServiceError } from "../errors/ServiceError.js";
import strict from "assert/strict";
import config from "../configs/config.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  try {
    console.log("Reached Controller");
    const data = await authService.register(req.body);

    //create accessToken
    const accessToken = signAccessToken({
      sub: data.user.userId,
      role: data.user.role,
    });
    //set cookies -accessToken
    res.cookie("accessToken", accessToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.accessMaxAge,
    });
    //create refresh token
    const refreshToken = signRefreshToken({ sub: data.user.userId });
    //set cookies -refreshToken
    res.cookie("refreshToken", refreshToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.refreshMaxAge,
    });

    res.status(201).json(data.user);
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

//Login
const loginUser = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  try {
    const data = await authService.login(req.body);

    //create accessToken
    const accessToken = signAccessToken({
      sub: data.user.userId,
      role: data.user.role,
    });
    //set cookies -accessToken
    res.cookie("accessToken", accessToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.accessMaxAge,
    });
    //create refreshToken
    const refreshToken = signRefreshToken({ sub: data.user.userId });
    //set cookies -refreshToken
    res.cookie("refreshToken", refreshToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.refreshMaxAge,
    });
    res.status(200).json(data.user);
  } catch (err) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// refresh Token
const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new ServiceError("No Refresh token found", 401);
    }

    const payload = verifyRefreshToken(token);

    //user checking for more security
    const data = await authService.getUserByUserID(Number(payload.sub));

    //generating new access token
    const newAccessToken = signAccessToken({
      sub: data.user.userId,
      role: data.user.role,
    });

    //generating new refresh token
    const newRefreshToken = signRefreshToken({ sub: data.user.userId });

    //setting the tokens in the cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.accessMaxAge,
    });

    //rotating refresh token for greater security
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: config.cookies.httpOnly,
      sameSite: config.cookies.sameSite,
      secure: config.cookies.secure,
      maxAge: config.cookies.refreshMaxAge,
    });
    console.log("cookies", req.cookies);

    res.status(200).json(data.user);
  } catch (err) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// //logout user

const logoutUser = (req: Request, res: Response) => {
  try {
    // Clear the cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// google sign in
const oauthSignIn = async (req: Request, res: Response) => {
  const userData = req.user as AuthUser;

  //token generation
  const accessToken = signAccessToken({
    sub: userData.user.userId,
    role: userData.user.role,
  });
  const refreshToken = signRefreshToken({ sub: userData.user.userId });

  //storing tokens in cookies
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

  res.redirect("http://localhost:3000/dashboard");
};
export default { registerUser, loginUser, refreshToken, logoutUser, oauthSignIn };
