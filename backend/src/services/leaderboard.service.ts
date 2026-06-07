import { prisma } from "../lib/prisma.js";
import { SUPPORTED_JUDGE0_IDS } from "../constants/languages.js";

export const getPointsLeaderboardService = async (periodStart: Date) => {
  const grouped = await prisma.activity.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: periodStart } },
    _sum: { xpGained: true },
    orderBy: { _sum: { xpGained: "desc" } },
    take: 20,
  });

  if (grouped.length === 0) return [];

  const userIds = grouped.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, full_name: true, username: true, profile_pic_url: true, level: true },
  });
  const userById = new Map(users.map((u) => [u.userId, u]));

  return grouped.map((g, idx) => {
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
};

export const getProblemLeaderboardService = async (
  problemId: number,
  languageId: number | null,
  metric: string,
) => {
  const problem = await prisma.problem.findUnique({
    where: { problemId },
    select: { problemId: true, title: true, difficulty: true },
  });
  if (!problem) return null;

  const where: any = {
    problemId,
    status: "ACCEPTED",
    ...(languageId ? { languageId } : { languageId: { in: SUPPORTED_JUDGE0_IDS } }),
  };

  const submissions = await prisma.submission.findMany({
    where,
    select: {
      userId: true, languageId: true, time: true, memory: true, createdAt: true,
      user: { select: { userId: true, full_name: true, username: true, profile_pic_url: true, level: true } },
    },
  });

  const bestMap = new Map<string, { value: number; sub: typeof submissions[0] }>();
  for (const sub of submissions) {
    const val = metric === "runtime" ? (sub.time ?? Infinity) : (sub.memory ?? Infinity);
    if (!isFinite(val) || val <= 0) continue;
    const key = `${sub.userId}:${sub.languageId}`;
    const existing = bestMap.get(key);
    if (!existing || val < existing.value) bestMap.set(key, { value: val, sub });
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
      value: metric === "runtime" ? `${(entry.value * 1000).toFixed(0)}ms` : `${(entry.value / 1024).toFixed(1)}MB`,
      rawValue: entry.value,
    }));

  return { problem, ranked };
};
