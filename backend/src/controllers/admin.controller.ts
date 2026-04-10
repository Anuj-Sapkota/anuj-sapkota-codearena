import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptedSubmissions,
      todaySubmissions,
      pendingApplications,
      flaggedDiscussions,
      totalResources,
      totalChallenges,
      difficultyBreakdown,
      weeklySubmissions,
      weeklySignups,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "ACCEPTED" } }),
      prisma.submission.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { creatorStatus: "PENDING" } }),
      prisma.discussion.count({ where: { reportCount: { gte: 3 }, isBlocked: false } }),
      prisma.resource.count(),
      prisma.challenge.count(),
      prisma.problem.groupBy({ by: ["difficulty"], _count: { problemId: true } }),
      prisma.submission.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { createdAt: true, status: true },
      }),
      // New users in the last 7 days
      prisma.user.findMany({
        where: { created_at: { gte: weekStart } },
        select: { created_at: true },
      }),
      prisma.user.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          userId: true, username: true, full_name: true,
          profile_pic_url: true, role: true, creatorStatus: true, created_at: true,
        },
      }),
    ]);

    // Build 7-day submission chart
    const chartMap = new Map<string, { total: number; accepted: number; newUsers: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      chartMap.set(key, { total: 0, accepted: 0, newUsers: 0 });
    }
    for (const sub of weeklySubmissions) {
      const key = sub.createdAt.toISOString().split("T")[0];
      if (chartMap.has(key)) {
        chartMap.get(key)!.total += 1;
        if (sub.status === "ACCEPTED") chartMap.get(key)!.accepted += 1;
      }
    }
    for (const u of weeklySignups) {
      const key = u.created_at.toISOString().split("T")[0];
      if (chartMap.has(key)) chartMap.get(key)!.newUsers += 1;
    }

    const submissionChart = Array.from(chartMap.entries()).map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      total: v.total,
      accepted: v.accepted,
      newUsers: v.newUsers,
    }));

    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      counts: {
        users: totalUsers,
        problems: totalProblems,
        submissions: totalSubmissions,
        acceptedSubmissions,
        todaySubmissions,
        pendingApplications,
        flaggedDiscussions,
        resources: totalResources,
        challenges: totalChallenges,
        acceptanceRate,
        newUsersThisWeek: weeklySignups.length,
      },
      difficultyBreakdown: difficultyBreakdown.map((d) => ({
        difficulty: d.difficulty,
        count: d._count.problemId,
      })),
      submissionChart,
      recentUsers,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

// ─── Users management ─────────────────────────────────────────────────────────

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1")));
    const limit = Math.min(20, parseInt(String(req.query.limit || "10")));
    const search = String(req.query.search || "");
    const role = req.query.role as string | undefined;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search ? {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { full_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(role && role !== "ALL" ? { role } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          userId: true, username: true, full_name: true, email: true,
          role: true, creatorStatus: true, profile_pic_url: true,
          xp: true, level: true, created_at: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { role },
      select: { userId: true, username: true, role: true },
    });

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // Soft ban: demote to USER and clear creator status
    const updated = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { role: "USER", creatorStatus: "NOT_APPLIED" },
      select: { userId: true, username: true, role: true },
    });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to ban user" });
  }
};
