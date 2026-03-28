import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { ServiceError } from "../errors/service.error.js";
import { prisma } from "../lib/prisma.js";

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new ServiceError("Authentication required", 401);
    }
    // 1. Extract values with clear naming
    const currUserId = Number(user.sub); // From auth middleware
    const targetUserId = Number(req.params.id);
    const updateData = req.body;
    const file = req.file; // Provided by Multer

    // 2. Validate that they are actual numbers (prevents /update/abc crashing the app)
    if (isNaN(targetUserId) || isNaN(currUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format. IDs must be numeric.",
      });
    }

    // 2. Call service layer
    const updatedUser = await userService.updateUserService(
      targetUserId,
      currUserId,
      updateData,
      file as any, // Casting if using Web File API vs Multer File
    );

    // 3. Return 200 OK (Standard for updates)
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new ServiceError("Authentication required", 401);
    }
    const userData = await userService.getUserByID(user.sub);

    return res.status(200).json({
      data: userData,
    });
  } catch (err) {
    next(err);
  }
};
const LANGUAGE_MAP: Record<number, string> = {
  63: "JavaScript",
  74: "TypeScript",
  71: "Python",
  62: "Java",
  54: "C++",
  50: "C",
  // Add other IDs as you support them
};
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;
  const targetId = Number(userId);

  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    // 1. Run parallel queries
    const [
      user,
      acceptedSubmissions, // For unique solved stats and languages
      recentSubmissions,
      heatmapSubmissions, // For total activity volume
    ] = await Promise.all([
      // A. User Info
      prisma.user.findUnique({
        where: { userId: targetId },
        select: {
          full_name: true,
          username: true,
          xp: true,
          level: true,
          streak: true,
          bio: true,
          created_at: true,
        },
      }),

      // B. All Accepted Submissions (Unique Problems)
      // We use distinct to ensure we only count a problem once
      prisma.submission.findMany({
        where: {
          userId: targetId,
          status: "ACCEPTED", // CHECK: Ensure this matches your DB exactly (likely all caps)
        },
        distinct: ["problemId"],
        include: { problem: { select: { difficulty: true } } },
      }),

      // C. Recent Submissions (Latest 10)
      prisma.submission.findMany({
        where: { userId: targetId, status: "ACCEPTED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { problem: { select: { title: true } } },
      }),

      // D. Heatmap Data (All Submissions - Volume of Activity)
      // We remove status filter here to show "amount of submission"
      prisma.submission.findMany({
        where: {
          userId: targetId,
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: { createdAt: true },
      }),
    ]);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Process Difficulty Stats (Unique count)
    const stats = {
      easy: acceptedSubmissions.filter(
        (s) => s.problem.difficulty.toUpperCase() === "EASY",
      ).length,
      medium: acceptedSubmissions.filter(
        (s) => s.problem.difficulty.toUpperCase() === "MEDIUM",
      ).length,
      hard: acceptedSubmissions.filter(
        (s) => s.problem.difficulty.toUpperCase() === "HARD",
      ).length,
    };

    // 3. Process Language Stats (Unique problems per language)
    const languageCounts: Record<number, number> = {};
    acceptedSubmissions.forEach((s) => {
      languageCounts[s.languageId] = (languageCounts[s.languageId] || 0) + 1;
    });

    const languageStats = Object.keys(languageCounts)
      .map((id) => ({
        name: LANGUAGE_MAP[Number(id)] || `Lang ${id}`,
        count: languageCounts[Number(id)],
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Heatmap Aggregation (Total Volume)
    const heatmapData = heatmapSubmissions.reduce((acc: any[], curr) => {
      const date = curr.createdAt.toISOString().split("T")[0];
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, []);

    return res.status(200).json({
      success: true,
      user: {
        name: user.full_name,
        username: user.username,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        bio: user.bio,
        joined: user.created_at,
      },
      stats,
      languageStats,
      heatmapData,
      recentSubmissions: recentSubmissions.map((s) => ({
        id: s.id,
        title: s.problem.title,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error(`[Profile Error for User ${userId}]:`, error);
    next(error);
  }
};
