import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/ServiceError.js";
import axios from "axios";
import config from "../configs/config.js";

export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { turnstileToken } = req.body;

    //checking if token exists
    if (!turnstileToken) {
      throw new ServiceError("Turnstile token not available", 400);
    }

    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: config.turnstile.secret,
        response: turnstileToken,
        remoteip: req.ip!,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    //Decision
    if (!response.data.success) {
      throw new ServiceError("Bot Verification Failed", 403);
    }

    // passed
    next();
  } catch (err) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "urnstile verification error" });
    }
  }
};
