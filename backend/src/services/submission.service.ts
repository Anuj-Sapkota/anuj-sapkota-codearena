import { prisma } from "../lib/prisma.js";
import { calculateLevel } from "../utils/gamification.js";
import {
  notifyFirstSolve,
  notifyLevelUp,
  notifyChallengeCompleted,
} from "./notification.service.js";

export const processSubmissionService = async (params: {
  userId: number;
  problemId: number;
  challengeSlug: string;
  source_code: string;
  language_id: number;
  finalStatus: string;
  totalPassed: number;
  totalCases: number;
  rawTime: number;
  rawMemory: number;
  failMessage: string | null;
  allPassed: boolean;
}) => {
  const {
    userId, problemId, challengeSlug, source_code, language_id,
    finalStatus, totalPassed, totalCases, rawTime, rawMemory,
    failMessage, allPassed,
  } = params;

  const [problem, challenge] = await Promise.all([
    prisma.problem.findUnique({ where: { problemId } }),
    challengeSlug
      ? prisma.challenge.findUnique({ where: { slug: challengeSlug } })
      : Promise.resolve(null),
  ]);

  if (!problem) return null;

  let notifyFirstSolveData: { title: string; xp: number } | null = null;
  let notifyLevelUpData: number | null = null;
  let notifyChallengeData: { title: string; xp: number } | null = null;

  const submission = await prisma.$transaction(async (tx) => {
    const sub = await tx.submission.create({
      data: {
        userId,
        problemId,
        challengeId: challenge?.challengeId ? Number(challenge.challengeId) : null,
        code: source_code,
        languageId: language_id,
        status: finalStatus,
        totalPassed,
        totalCases,
        time: rawTime,
        memory: Math.round(rawMemory),
        failMessage,
      },
    });

    if (allPassed) {
      await tx.userProblemStatus.upsert({
        where: { userId_problemId: { userId, problemId } },
        update: { status: "SOLVED" },
        create: { userId, problemId, status: "SOLVED" },
      });

      const previousSolved = await tx.submission.count({
        where: { userId, problemId, status: "ACCEPTED", id: { not: sub.id } },
      });

      const now = new Date();
      const user = await tx.user.findUnique({ where: { userId } });

      if (user) {
        let newStreak = user.streak;
        if (user.lastActivityDate) {
          const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastMidnight = new Date(
            user.lastActivityDate.getFullYear(),
            user.lastActivityDate.getMonth(),
            user.lastActivityDate.getDate(),
          );
          const daysDiff = Math.round(
            (todayMidnight.getTime() - lastMidnight.getTime()) / 86_400_000,
          );
          if (daysDiff === 0) newStreak = user.streak;
          else if (daysDiff === 1) newStreak = user.streak + 1;
          else newStreak = 1;
        } else {
          newStreak = 1;
        }

        if (previousSolved === 0) {
          const xpGained = problem.points || 50;
          const newTotalXp = user.xp + xpGained;
          const newLevel = calculateLevel(newTotalXp);
          const leveledUp = newLevel > user.level;

          await tx.user.update({
            where: { userId },
            data: { xp: newTotalXp, total_points: { increment: xpGained }, streak: newStreak, lastActivityDate: now, level: newLevel },
          });
          await tx.activity.create({
            data: { userId, type: `${problem.difficulty.toUpperCase()}_SOLVED`, xpGained, createdAt: now },
          });

          notifyFirstSolveData = { title: problem.title, xp: xpGained };
          if (leveledUp) notifyLevelUpData = newLevel;
        } else {
          await tx.user.update({
            where: { userId },
            data: { streak: newStreak, lastActivityDate: now },
          });
        }
      }

      if (challenge?.challengeId && challenge.points > 0) {
        const challengeProblems = await tx.challengeProblem.findMany({
          where: { challengeId: challenge.challengeId },
          select: { problemId: true },
        });

        const distinctSolved = await tx.submission.findMany({
          where: { userId, challengeId: challenge.challengeId, status: "ACCEPTED" },
          distinct: ["problemId"],
          select: { problemId: true },
        });

        if (distinctSolved.length === challengeProblems.length) {
          const alreadyBonused = await tx.activity.findFirst({
            where: { userId, type: `CHALLENGE_COMPLETED_${challenge.challengeId}` },
          });

          if (!alreadyBonused) {
            const bonusXp = challenge.points;
            const freshUser = await tx.user.findUnique({
              where: { userId },
              select: { xp: true, level: true },
            });
            const newTotalXp = (freshUser?.xp ?? 0) + bonusXp;
            const newLevel = calculateLevel(newTotalXp);

            await tx.user.update({
              where: { userId },
              data: { xp: newTotalXp, total_points: { increment: bonusXp }, level: newLevel },
            });
            await tx.activity.create({
              data: { userId, type: `CHALLENGE_COMPLETED_${challenge.challengeId}`, xpGained: bonusXp },
            });

            notifyChallengeData = { title: challenge.title, xp: bonusXp };
          }
        }
      }
    }

    return sub;
  });

  // Fire notifications after transaction
  if (notifyFirstSolveData) notifyFirstSolve(userId, notifyFirstSolveData.title, notifyFirstSolveData.xp).catch(() => {});
  if (notifyLevelUpData) notifyLevelUp(userId, notifyLevelUpData).catch(() => {});
  if (notifyChallengeData) notifyChallengeCompleted(userId, notifyChallengeData.title, notifyChallengeData.xp).catch(() => {});

  return submission;
};

export const getSubmissionHistoryService = async (userId: number, problemId: number) => {
  return prisma.submission.findMany({
    where: { userId, problemId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, status: true, time: true, memory: true,
      createdAt: true, languageId: true, code: true,
      totalPassed: true, totalCases: true, failMessage: true,
    },
  });
};

export const getSubmissionStatsService = async (problemId: number, languageId?: number) => {
  const where: any = {
    problemId,
    status: "ACCEPTED",
    time: { not: null },
    memory: { not: null },
  };
  if (languageId) where.languageId = languageId;

  return prisma.submission.findMany({
    where,
    select: { time: true, memory: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
};
