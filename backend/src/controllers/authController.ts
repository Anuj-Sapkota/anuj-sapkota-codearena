import type { Request, Response } from "express";

import authService from "../services/authService.js";
import type { LoginInput, RegisterInput } from "../types/auth.js";
import { ServiceError } from "../errors/ServiceError.js";

const registerUser = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  try {
    console.log("Reached Controller");
    const data = await authService.register(req.body);
    res.status(201).json(data);
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
    res.status(200).json(data);
  } catch (err) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default { registerUser, loginUser };
