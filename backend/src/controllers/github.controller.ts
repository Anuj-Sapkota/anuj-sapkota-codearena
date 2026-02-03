import {
  getUserRepos,
  pushFile,
  getContents,
  createFolder,
} from "../services/github.service.js";
import type { Request, Response, NextFunction } from "express";
import { findUserRaw } from "../services/user.service.js";
import { prisma } from "../lib/prisma.js";
import axios from "axios";

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

//code pushing to github controller
export const pushCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { repoFullName, code, path, commitMessage } = req.body;
  const userId = (req as any).user.sub;

  try {
    // 1. Fetch user to get the GitHub Token
    const user = await findUserRaw(userId);

    if (!user?.github_access_token) {
      return res.status(401).json({
        success: false,
        message: "GitHub account not linked or token missing.",
      });
    }

    // 2. Delegate to Service
    const result = await pushFile(
      user.github_access_token,
      repoFullName,
      path,
      code,
      commitMessage || "CodeArena: Solution Submission",
    );

    return res.status(200).json({
      success: true,
      message: "Successfully pushed to GitHub",
      url: result.content.html_url,
    });
  } catch (err) {
    next(err);
  }
};

// backend/controllers/github.controller.ts

export const getRepoContents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { owner, repo } = req.params;
  const path = (req.query.path as string) || "";
  const userId = (req as any).user.sub;

  try {
    const user = await findUserRaw(userId);
    if (!user?.github_access_token)
      return res.status(401).json({ message: "Not connected" });

    const contents = await getContents(
      user.github_access_token,
      `${owner}/${repo}`,
      path,
    );

    // Sort: Folders first, then files
    const sortedContents = Array.isArray(contents)
      ? contents.sort(
          (a: any, b: any) =>
            (b.type === "dir" ? 1 : -1) - (a.type === "dir" ? 1 : -1),
        )
      : contents;

    res.status(200).json(sortedContents);
  } catch (err) {
    next(err);
  }
};

export const folderCreation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { owner, repo, path, folderName } = req.body;
  const userId = (req as any).user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
    });
    if (!user?.github_access_token) {
      return res.status(401).json({ message: "GitHub not connected" });
    }

    await createFolder(
      user.github_access_token,
      `${owner}/${repo}`,
      path,
      folderName,
    );

    return res.status(201).json({ success: true, message: "Folder created" });
  } catch (err) {
    next(err);
  }
};
