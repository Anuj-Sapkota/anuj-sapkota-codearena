import type { Request, Response } from "express";
import { JUDGE0_LANGUAGE_MAP, SUPPORTED_LANGUAGES, SUPPORTED_JUDGE0_IDS } from "../constants/languages.js";
import { getPointsLeaderboardService, getProblemLeaderboardService } from "../services/leaderboard.service.js";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "monthly") return new Date(now.getFullYear(), now.getMonth(), 1);
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const period = String(req.query.period || "weekly");
    const type = String(req.query.type || "points");
    const periodStart = getPeriodStart(period);

    if (type !== "points") {
      return res.status(400).json({ message: "Use /leaderboard/problem/:problemId for runtime/memory rankings" });
    }

    const rankings = await getPointsLeaderboardService(periodStart);
    return res.json({ type, period, periodStart, updatedAt: new Date(), rankings });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

export const getProblemLeaderboard = async (req: Request, res: Response) => {
  try {
    const problemId = Number(req.params.problemId);
    const languageId = req.query.languageId ? Number(req.query.languageId) : null;
    const metric = String(req.query.metric || "runtime");

    if (isNaN(problemId)) return res.status(400).json({ message: "Invalid problemId" });
    if (languageId && !SUPPORTED_JUDGE0_IDS.includes(languageId as any)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const result = await getProblemLeaderboardService(problemId, languageId, metric);
    if (!result) return res.status(404).json({ message: "Problem not found" });

    return res.json({
      problem: result.problem,
      metric,
      languageId,
      languageName: languageId ? (JUDGE0_LANGUAGE_MAP[languageId] || "Unknown") : "All Languages",
      updatedAt: new Date(),
      rankings: result.ranked,
      availableLanguages: SUPPORTED_LANGUAGES.map((l) => ({ id: l.judge0Id, name: l.label })),
    });
  } catch (err: any) {
    console.error("Problem leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch problem leaderboard" });
  }
};
