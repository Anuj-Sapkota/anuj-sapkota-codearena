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
      // Sum XP gained from activities in the period
      const activities = await prisma.activity.findMany({
        where: { createdAt: { gte: periodStart } },
        select: {
          userId: true,
          xpGained: true,
          user: {
            select: {
              userId: true,
              full_name: true,
              username: true,
              profile_pic_url: true,
              level: true,
            },
          },
        },
      });

      const userMap = new Map<number, { user: any; totalPoints: number }>();
      for (const act of activities) {
        if (!userMap.has(act.userId)) {
          userMap.set(act.userId, { user: act.user, totalPoints: 0 });
        }
        userMap.get(act.userId)!.totalPoints += act.xpGained;
      }

      const ranked = Array.from(userMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20)
        .map((entry, idx) => ({
          rank: idx + 1,
          userId: entry.user.userId,
          username: entry.user.username,
          fullName: entry.user.full_name,
          avatar: entry.user.profile_pic_url,
          level: entry.user.level,
          problemsSolved: 0,
          totalValue: entry.totalPoints,
          unit: "pts",
        }));

      return res.json({
        type,
        period,
        languageId: null,
        languageName: "All Languages",
        periodStart,
        updatedAt: new Date(),
        rankings: ranked,
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
