import type { NextFunction, Request, Response } from "express";
import * as Judge0Service from "../services/judge0.service.js";
import { prisma } from "../lib/prisma.js";
import { wrapUserCode } from "../utils/code-wrapper.util.js";
import {
  notifyFirstSolve,
  notifyLevelUp,
  notifyChallengeCompleted,
} from "../services/notification.service.js";
import { calculateLevel } from "../utils/gamification.js";

// Helper function at the top of submission.controller.ts
const calculateMetrics = (results: any[]) => {
  const peakTime = Math.max(...results.map((r) => parseFloat(r.time || "0")));
  const peakMemory = Math.max(...results.map((r) => r.memory || 0));

  return {
    runtime: `${(peakTime * 1000).toFixed(0)}ms`,
    memory: `${(peakMemory / 1024).toFixed(1)}MB`,
    rawTime: peakTime,
    rawMemory: peakMemory,
  };
};
export const handleSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { source_code, language_id, problemId, isFinal, challengeSlug } =
    req.body;
  console.log("Challenge Id from the submission controller: ", challengeSlug); ///-------------------------------
  const userId = (req as any).user.sub;

  try {
    const problem = await prisma.problem.findUnique({
      where: { problemId: Number(problemId) },
      include: { testCases: true },
    });

    const challenge = await prisma.challenge.findUnique({
      where: { slug: String(challengeSlug) },
    });

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }
    const results = await Promise.all(
      problem.testCases.map(async (tc) => {
        const wrappedCode = wrapUserCode(
          source_code,
          language_id,
          tc.input,
          problem.functionName || "solution",
          problem.inputType,
        );

        const execution = await Judge0Service.submitCode(
          wrappedCode,
          language_id,
          tc.input,
          problem.timeLimit,
          problem.memoryLimit,
        );

        const statusId = execution?.status?.id;

        const actualOutput = execution.stdout
          ? Buffer.from(execution.stdout, "base64").toString("utf-8").trim()
          : "";

        // --- 🔍 ROBUST COMPARISON LOGIC ---
        // This helper removes all brackets, spaces, and extra commas
        // to compare only the raw values.
        const clean = (str: string) =>
          str.replace(/[\[\]\s]/g, "").replace(/,,+/g, ",");

        const normalizedActual = clean(actualOutput);
        const normalizedExpected = clean(tc.expectedOutput);

        const isMatch =
          normalizedActual === normalizedExpected && normalizedActual !== "";
        const isCorrect = statusId === 3 && isMatch;

        // Diagnostic log to see why it fails even with clean comparison
        console.log(`CASE ${tc.id} | Status: ${statusId} | Match: ${isMatch}`);
        if (!isMatch) {
          console.log(`  Expected Clean: ${normalizedExpected}`);
          console.log(`  Actual Clean:   ${normalizedActual}`);
        }

        const decodeB64 = (s: string | null | undefined): string => {
          if (!s) return "";
          try { return Buffer.from(s, "base64").toString("utf-8").trim(); } catch { return s; }
        };

        const decodedStderr = decodeB64(execution.stderr);
        const decodedCompileOutput = decodeB64(execution.compile_output);

        return {
          ...execution,
          stderr: decodedStderr,
          compile_output: decodedCompileOutput,
          isCorrect,
          decodedOutput: actualOutput,
          isSample: tc.isSample,
        };
      }),
    );

    const metrics = calculateMetrics(results);
    const allPassed = results.every((r) => r.isCorrect);
    const totalPassed = results.filter((r) => r.isCorrect).length;

    const firstFailure = results.find((r) => !r.isCorrect);

    const failMessage =
      firstFailure?.compile_output ||
      firstFailure?.stderr ||
      firstFailure?.message ||
      null;

    let finalStatus = allPassed ? "ACCEPTED" : "WRONG_ANSWER";

    if (results.find((r) => r.status?.id === 6)) {
      finalStatus = "COMPILATION_ERROR";
    } else if (results.find((r) => r.status?.id >= 7 && r.status?.id <= 12)) {
      finalStatus = "RUNTIME_ERROR";
    }

    let newSubmission = null;
    // Track what happened for post-transaction notifications
    let notifyFirstSolveData: { title: string; xp: number } | null = null;
    let notifyLevelUpData: number | null = null;
    let notifyChallengeData: { title: string; xp: number } | null = null;

    if (isFinal && userId) {
      newSubmission = await prisma.$transaction(async (tx) => {
        // 1. Create the submission record
        const submission = await tx.submission.create({
          data: {
            userId: Number(userId),
            problemId: Number(problemId),
            challengeId: challenge?.challengeId
              ? Number(challenge.challengeId)
              : null,
            code: source_code,
            languageId: Number(language_id),
            status: finalStatus,
            totalPassed,
            totalCases: results.length,
            time: metrics.rawTime,
            memory: Math.round(metrics.rawMemory),
            failMessage: failMessage,
          },
        });

        // 2. If everything passed, handle Status AND Gamification
        if (allPassed) {
          // Update/Create Problem Status
          await tx.userProblemStatus.upsert({
            where: {
              userId_problemId: {
                userId: Number(userId),
                problemId: Number(problemId),
              },
            },
            update: { status: "SOLVED" },
            create: {
              userId: Number(userId),
              problemId: Number(problemId),
              status: "SOLVED",
            },
          });

          // --- 🏆 GAMIFICATION LOGIC ---
          const previousSolved = await tx.submission.count({
            where: {
              userId: Number(userId),
              problemId: Number(problemId),
              status: "ACCEPTED",
              id: { not: submission.id },
            },
          });

          const now = new Date();
          const user = await tx.user.findUnique({ where: { userId: Number(userId) } });

          if (user) {
            // ── Streak: calendar-day based ──
            let newStreak = user.streak;
            if (user.lastActivityDate) {
              const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const lastMidnight = new Date(user.lastActivityDate.getFullYear(), user.lastActivityDate.getMonth(), user.lastActivityDate.getDate());
              const daysDiff = Math.round((todayMidnight.getTime() - lastMidnight.getTime()) / 86_400_000);
              if (daysDiff === 0) newStreak = user.streak;
              else if (daysDiff === 1) newStreak = user.streak + 1;
              else newStreak = 1;
            } else {
              newStreak = 1;
            }

            if (previousSolved === 0) {
              // First solve: award XP, recalculate level correctly
              const xpGained = problem.points || 50;
              const newTotalXp = user.xp + xpGained;
              const newLevel = calculateLevel(newTotalXp);
              const leveledUp = newLevel > user.level;

              await tx.user.update({
                where: { userId: Number(userId) },
                data: {
                  xp: newTotalXp,
                  total_points: { increment: xpGained },
                  streak: newStreak,
                  lastActivityDate: now,
                  level: newLevel,
                },
              });
              await tx.activity.create({
                data: {
                  userId: Number(userId),
                  type: `${problem.difficulty.toUpperCase()}_SOLVED`,
                  xpGained,
                  createdAt: now,
                },
              });

              // Queue notifications (fire after transaction)
              notifyFirstSolveData = { title: problem.title, xp: xpGained };
              if (leveledUp) notifyLevelUpData = newLevel;
            } else {
              // Re-solve: only update streak
              await tx.user.update({
                where: { userId: Number(userId) },
                data: { streak: newStreak, lastActivityDate: now },
              });
            }
          }

          // --- 🏆 CHALLENGE COMPLETION BONUS ---
          if (challenge?.challengeId && challenge.points > 0) {
            const challengeProblems = await tx.challengeProblem.findMany({
              where: { challengeId: challenge.challengeId },
              select: { problemId: true },
            });
            const totalInChallenge = challengeProblems.length;

            const distinctSolved = await tx.submission.findMany({
              where: {
                userId: Number(userId),
                challengeId: challenge.challengeId,
                status: "ACCEPTED",
              },
              distinct: ["problemId"],
              select: { problemId: true },
            });

            if (distinctSolved.length === totalInChallenge) {
              const alreadyBonused = await tx.activity.findFirst({
                where: {
                  userId: Number(userId),
                  type: `CHALLENGE_COMPLETED_${challenge.challengeId}`,
                },
              });
              if (!alreadyBonused) {
                const bonusXp = challenge.points;
                // Fetch fresh user XP to recalculate level correctly
                const freshUser = await tx.user.findUnique({
                  where: { userId: Number(userId) },
                  select: { xp: true, level: true },
                });
                const newTotalXp = (freshUser?.xp ?? 0) + bonusXp;
                const newLevel = calculateLevel(newTotalXp);

                await tx.user.update({
                  where: { userId: Number(userId) },
                  data: {
                    xp: newTotalXp,
                    total_points: { increment: bonusXp },
                    level: newLevel,
                  },
                });
                await tx.activity.create({
                  data: {
                    userId: Number(userId),
                    type: `CHALLENGE_COMPLETED_${challenge.challengeId}`,
                    xpGained: bonusXp,
                  },
                });

                notifyChallengeData = { title: challenge.title, xp: bonusXp };
              }
            }
          }
        }
        return submission;
      });

      // ── Fire notifications after transaction commits ──────────────────────
      if (notifyFirstSolveData) {
        notifyFirstSolve(Number(userId), notifyFirstSolveData.title, notifyFirstSolveData.xp).catch(() => {});
      }
      if (notifyLevelUpData) {
        notifyLevelUp(Number(userId), notifyLevelUpData).catch(() => {});
      }
      if (notifyChallengeData) {
        notifyChallengeCompleted(Number(userId), notifyChallengeData.title, notifyChallengeData.xp).catch(() => {});
      }
    }

    return res.status(200).json({
      success: true,
      results,
      allPassed,
      totalPassed,
      totalCases: results.length,
      metrics: { runtime: metrics.runtime, memory: metrics.memory },
      newSubmission,
    });
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};
// --- submission.controller.ts ---
export const getSubmissionHistory = async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = (req as any).user.sub;

  try {
    const history = await prisma.submission.findMany({
      where: {
        userId: Number(userId),
        problemId: Number(problemId),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        time: true,
        memory: true,
        createdAt: true,
        languageId: true,
        code: true,
        totalPassed: true,
        totalCases: true,
        failMessage: true,
      },
    });

    res.status(200).json({ success: true, history });
  } catch (error: any) {
    console.error("PRISMA DATABASE ERROR:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Database error fetching history" });
  }
};

/**
 * GET /api/submissions/stats/:problemId
 * Returns runtime + memory of all accepted submissions for a problem.
 * Used to compute accurate "beats X%" percentile on the frontend.
 */
export const getSubmissionStats = async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const { languageId } = req.query;

  try {
    const where: any = {
      problemId: Number(problemId),
      status: "ACCEPTED",
      time: { not: null },
      memory: { not: null },
    };
    if (languageId) where.languageId = Number(languageId);

    const accepted = await prisma.submission.findMany({
      where,
      select: { time: true, memory: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    res.status(200).json({ success: true, stats: accepted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
