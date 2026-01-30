import { getUserRepos } from "../services/github.service.js";
import type { Request, Response, NextFunction } from "express";

export const getRepos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.sub;
    const repos = await getUserRepos(Number(userId));
    res.status(200).json({ success: true, repos });
  } catch (err) {
    next(err);
  }
};
