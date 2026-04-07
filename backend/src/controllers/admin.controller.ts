import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * GET /api/admin/stats
 * Returns all platform-wide metrics needed for the admin dashboard.
 */
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
      recentUsers,
    ] = await Promise.all([
      // Core counts
      prisma.user.count(),
      prisma.problem.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "ACCEPTED" } }),
      prisma.submission.count({ where: { createdAt: { gte: todayStart } } }),

      // Pending creator applications
      prisma.user.count({ where: { creatorStatus: "PENDING" } }),

      // Flagged discussions needing review
      prisma.discussion.count({ where: { reportCount: { gte: 3 }, isBlocked: false } }),

      // Content counts
      prisma.resource.count(),
      prisma.challenge.count(),

      // Problem difficulty breakdown
      prisma.problem.groupBy({
        by: ["difficulty"],
        _count: { problemId: true },
      }),

      // Last 7 days submissions per day (for the chart)
      prisma.submission.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { createdAt: true, status: true },
      }),

      // 5 most recently joined users
      prisma.user.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          userId: true,
          username: true,
          full_name: true,
          profile_pic_url: true,
          role: true,
          creatorStatus: true,
          created_at: true,
        },
      }),
    ]);

    // Build 7-day chart data
    const chartMap = new Map<string, { total: number; accepted: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      chartMap.set(key, { total: 0, accepted: 0 });
    }
    for (const sub of weeklySubmissions) {
      const key = sub.createdAt.toISOString().split("T")[0];
      if (chartMap.has(key)) {
        chartMap.get(key)!.total += 1;
        if (sub.status === "ACCEPTED") chartMap.get(key)!.accepted += 1;
      }
    }
    const submissionChart = Array.from(chartMap.entries()).map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      total: v.total,
      accepted: v.accepted,
    }));

    const acceptanceRate =
      totalSubmissions > 0
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
