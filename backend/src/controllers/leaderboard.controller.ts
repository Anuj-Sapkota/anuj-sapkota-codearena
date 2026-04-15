import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { JUDGE0_LANGUAGE_MAP, SUPPORTED_LANGUAGES, SUPPORTED_JUDGE0_IDS } from "../constants/languages.js";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// GET /api/leaderboard?period=weekly|monthly&type=points
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const period = String(req.query.period || "weekly");
    const type = String(req.query.type || "points");
    const periodStart = getPeriodStart(period);

    if (type !== "points") {
      return res.status(400).json({ message: "Use /leaderboard/problem/:problemId for runtime/memory rankings" });
    }

    const grouped = await prisma.activity.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: periodStart } },
      _sum: { xpGained: true },
      orderBy: { _sum: { xpGained: "desc" } },
      take: 20,
    });

    if (grouped.length === 0) {
      return res.json({ type, period, periodStart, updatedAt: new Date(), rankings: [] });
    }

    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, full_name: true, username: true, profile_pic_url: true, level: true },
    });
    const userById = new Map(users.map((u) => [u.userId, u]));

    const ranked = grouped.map((g, idx) => {
      const u = userById.get(g.userId)!;
      return {
        rank: idx + 1,
        userId: u.userId,
        username: u.username,
        fullName: u.full_name,
        avatar: u.profile_pic_url,
        level: u.level,
        totalValue: g._sum.xpGained ?? 0,
        unit: "pts",
      };
    });

    return res.json({ type, period, periodStart, updatedAt: new Date(), rankings: ranked });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

// GET /api/leaderboard/problem/:problemId?languageId=63&metric=runtime|memory
export const getProblemLeaderboard = async (req: Request, res: Response) => {
  try {
    const problemId = Number(req.params.problemId);
    const languageId = req.query.languageId ? Number(req.query.languageId) : null;
    const metric = String(req.query.metric || "runtime");

    if (isNaN(problemId)) return res.status(400).json({ message: "Invalid problemId" });
    if (languageId && !SUPPORTED_JUDGE0_IDS.includes(languageId as any)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const problem = await prisma.problem.findUnique({
      where: { problemId },
      select: { problemId: true, title: true, difficulty: true },
    });
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const where: any = {
      problemId,
      status: "ACCEPTED",
      ...(languageId ? { languageId } : { languageId: { in: SUPPORTED_JUDGE0_IDS } }),
    };

    const submissions = await prisma.submission.findMany({
      where,
      select: {
        userId: true,
        languageId: true,
        time: true,
        memory: true,
        createdAt: true,
        user: {
          select: { userId: true, full_name: true, username: true, profile_pic_url: true, level: true },
        },
      },
    });

    const bestMap = new Map<string, { value: number; sub: typeof submissions[0] }>();
    for (const sub of submissions) {
      const val = metric === "runtime" ? (sub.time ?? Infinity) : (sub.memory ?? Infinity);
      if (!isFinite(val) || val <= 0) continue;
      const key = `${sub.userId}:${sub.languageId}`;
      const existing = bestMap.get(key);
      if (!existing || val < existing.value) {
        bestMap.set(key, { value: val, sub });
      }
    }

    const ranked = Array.from(bestMap.values())
      .sort((a, b) => a.value - b.value)
      .slice(0, 20)
      .map((entry, idx) => ({
        rank: idx + 1,
        userId: entry.sub.user.userId,
        username: entry.sub.user.username,
        fullName: entry.sub.user.full_name,
        avatar: entry.sub.user.profile_pic_url,
        level: entry.sub.user.level,
        languageId: entry.sub.languageId,
        languageName: JUDGE0_LANGUAGE_MAP[entry.sub.languageId] || "Unknown",
        value: metric === "runtime"
          ? `${(entry.value * 1000).toFixed(0)}ms`
          : `${(entry.value / 1024).toFixed(1)}MB`,
        rawValue: entry.value,
      }));

    return res.json({
      problem,
      metric,
      languageId,
      languageName: languageId ? (JUDGE0_LANGUAGE_MAP[languageId] || "Unknown") : "All Languages",
      updatedAt: new Date(),
      rankings: ranked,
      availableLanguages: SUPPORTED_LANGUAGES.map((l) => ({ id: l.judge0Id, name: l.label })),
    });
  } catch (err: any) {
    console.error("Problem leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch problem leaderboard" });
  }
};
