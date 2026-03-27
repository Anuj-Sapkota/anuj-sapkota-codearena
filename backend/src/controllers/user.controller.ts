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

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  console.log("User id in backend: ", userId);

  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      include: {
        _count: {
          select: { submissions: { where: { status: "ACCEPTED" } } },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Get Solved Counts by Difficulty
    const solvedStats = await prisma.submission.groupBy({
      by: ["status"],
      where: {
        userId: Number(userId),
        status: "ACCEPTED",
      },
      _count: true,
    });

    // To get specific difficulty counts, we query the Problem relation
    const difficultyCounts = await prisma.submission.findMany({
      where: { userId: Number(userId), status: "ACCEPTED" },
      include: { problem: { select: { difficulty: true } } },
    });

    const stats = {
      easy: difficultyCounts.filter(
        (s) => s.problem.difficulty.toUpperCase() === "EASY",
      ).length,
      medium: difficultyCounts.filter(
        (s) => s.problem.difficulty.toUpperCase() === "MEDIUM",
      ).length,
      hard: difficultyCounts.filter(
        (s) => s.problem.difficulty.toUpperCase() === "HARD",
      ).length,
    };

    // 2. Get Heatmap Data (Last 365 Days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId: Number(userId),
        createdAt: { gte: oneYearAgo },
      },
      select: { createdAt: true, xpGained: true },
    });

    // Format for React Calendar Heatmap: [{ date: '2026-01-01', count: 5 }]
    const heatmapData = activities.reduce((acc: any, curr) => {
      const date = curr.createdAt.toISOString().split("T")[0];
      const existing = acc.find((item: any) => item.date === date);
      if (existing) existing.count += 1;
      else acc.push({ date, count: 1 });
      return acc;
    }, []);
    // MAKE SEPERATE FUNCTION FOR THIS DURING TESTING
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        userId: Number(userId),
        status: "ACCEPTED",
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        problem: { select: { title: true } },
      },
    });

    res.status(200).json({
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
      heatmapData,
      recentSubmissions: recentSubmissions.map((s) => ({
        id: s.id,
        title: s.problem.title,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};
