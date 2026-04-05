import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { JUDGE0_LANGUAGE_MAP, SUPPORTED_LANGUAGES, SUPPORTED_JUDGE0_IDS } from "../constants/languages.js";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  // weekly — Monday of current week
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// GET /api/leaderboard?period=weekly|monthly&languageId=63&type=runtime|memory|points
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const period = String(req.query.period || "weekly");
    const type = String(req.query.type || "points"); // "runtime" | "memory" | "points"
    const languageId = req.query.languageId ? Number(req.query.languageId) : null;

    // Validate languageId is one we support
    if (languageId && !SUPPORTED_JUDGE0_IDS.includes(languageId as any)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const periodStart = getPeriodStart(period);

    // ── POINTS leaderboard ────────────────────────────────────────────────────
    if (type === "points") {
      // Aggregate XP per user directly in the DB — no full table scan into memory
      const grouped = await prisma.activity.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: periodStart } },
        _sum: { xpGained: true },
        orderBy: { _sum: { xpGained: "desc" } },
        take: 20,
      });

      if (grouped.length === 0) {
        return res.json({
          type, period, languageId: null, languageName: "All Languages",
          periodStart, updatedAt: new Date(), rankings: [],
          availableLanguages: SUPPORTED_LANGUAGES.map((l) => ({ id: l.judge0Id, name: l.label })),
        });
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
          problemsSolved: 0,
          totalValue: g._sum.xpGained ?? 0,
          unit: "pts",
        };
      });

      return res.json({
        type, period, languageId: null, languageName: "All Languages",
        periodStart, updatedAt: new Date(), rankings: ranked,
        availableLanguages: SUPPORTED_LANGUAGES.map((l) => ({ id: l.judge0Id, name: l.label })),
      });
    }

    // ── RUNTIME / MEMORY leaderboard ──────────────────────────────────────────
    const where: any = {
      status: "ACCEPTED",
      createdAt: { gte: periodStart },
      // Only include submissions for supported languages
      languageId: languageId ? languageId : { in: SUPPORTED_JUDGE0_IDS },
    };

    const submissions = await prisma.submission.findMany({
      where,
      select: {
        userId: true,
        problemId: true,
        languageId: true,
        time: true,
        memory: true,
        user: {
          select: {
            userId: true,
            full_name: true,
            username: true,
            profile_pic_url: true,
            level: true,
          },
        },
        problem: { select: { title: true, difficulty: true, points: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Best (lowest) value per (userId, problemId, languageId)
    const bestPerProblem = new Map<string, { value: number; sub: typeof submissions[0] }>();
    for (const sub of submissions) {
      const val = type === "runtime" ? (sub.time ?? Infinity) : (sub.memory ?? Infinity);
      if (!isFinite(val)) continue;
      const key = `${sub.userId}:${sub.problemId}:${sub.languageId}`;
      const existing = bestPerProblem.get(key);
      if (!existing || val < existing.value) {
        bestPerProblem.set(key, { value: val, sub });
      }
    }

    const userMap = new Map<number, { user: any; totalValue: number; problemsSolved: number }>();
    for (const { value, sub } of bestPerProblem.values()) {
      const uid = sub.userId;
      if (!userMap.has(uid)) {
        userMap.set(uid, { user: sub.user, totalValue: 0, problemsSolved: 0 });
      }
      const entry = userMap.get(uid)!;
      entry.totalValue += value;
      entry.problemsSolved += 1;
    }

    const ranked = Array.from(userMap.values())
      .sort((a, b) => a.totalValue - b.totalValue) // lowest wins
      .slice(0, 20)
      .map((entry, idx) => ({
        rank: idx + 1,
        userId: entry.user.userId,
        username: entry.user.username,
        fullName: entry.user.full_name,
        avatar: entry.user.profile_pic_url,
        level: entry.user.level,
        problemsSolved: entry.problemsSolved,
        totalValue: Math.round(entry.totalValue * (type === "runtime" ? 1000 : 1)),
        unit: type === "runtime" ? "ms" : "KB",
      }));

    res.json({
      type,
      period,
      languageId,
      languageName: languageId ? (JUDGE0_LANGUAGE_MAP[languageId] || "Unknown") : "All Languages",
      periodStart,
      updatedAt: new Date(),
      rankings: ranked,
      availableLanguages: SUPPORTED_LANGUAGES.map((l) => ({ id: l.judge0Id, name: l.label })),
    });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
