import type { NextFunction, Request, Response } from "express";
import * as Judge0Service from "../services/judge0.service.js";
import { prisma } from "../lib/prisma.js";
import { wrapUserCode } from "../utils/code-wrapper.util.js";

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

        return {
          ...execution,
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

          // --- 🏆 GAMIFICATION LOGIC START ---
          // Check if this is the FIRST time they solved it to prevent XP farming
          const previousSolved = await tx.submission.count({
            where: {
              userId: Number(userId),
              problemId: Number(problemId),
              status: "ACCEPTED",
              id: { not: submission.id },
            },
          });

          if (previousSolved === 0) {
            const xpGained = problem.points || 50;
            const now = new Date();

            const user = await tx.user.findUnique({
              where: { userId: Number(userId) },
            });

            if (user) {
              let newStreak = user.streak;
              if (user.lastActivityDate) {
                const hoursSince =
                  (now.getTime() - user.lastActivityDate.getTime()) /
                  (1000 * 60 * 60);
                if (hoursSince >= 24 && hoursSince <= 48) newStreak++;
                else if (hoursSince > 48) newStreak = 1;
              } else {
                newStreak = 1;
              }

              await tx.user.update({
                where: { userId: Number(userId) },
                data: {
                  xp: { increment: xpGained },
                  total_points: { increment: xpGained },
                  streak: newStreak,
                  lastActivityDate: now,
                  level: Math.floor((user.xp + xpGained) / 500) + 1,
                },
              });

              await tx.activity.create({
                data: {
                  userId: Number(userId),
                  type: `${problem.difficulty.toUpperCase()}_SOLVED`,
                  xpGained: xpGained,
                  createdAt: now,
                },
              });
            }
          }

          // --- 🏆 CHALLENGE COMPLETION BONUS ---
          // If this submission is part of a challenge, check if user finished all problems
          if (challenge?.challengeId && challenge.points > 0) {
            const challengeProblems = await tx.challengeProblem.findMany({
              where: { challengeId: challenge.challengeId },
              select: { problemId: true },
            });
            const totalInChallenge = challengeProblems.length;
            const solvedInChallenge = await tx.submission.count({
              where: {
                userId: Number(userId),
                challengeId: challenge.challengeId,
                status: "ACCEPTED",
                problemId: { in: challengeProblems.map((cp) => cp.problemId) },
              },
              // distinct by problemId to avoid counting multiple solves of same problem
            });
            // Count distinct problems solved
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
              // Check they haven't already received the bonus
              const alreadyBonused = await tx.activity.findFirst({
                where: {
                  userId: Number(userId),
                  type: `CHALLENGE_COMPLETED_${challenge.challengeId}`,
                },
              });
              if (!alreadyBonused) {
                const bonusXp = challenge.points;
                await tx.user.update({
                  where: { userId: Number(userId) },
                  data: {
                    xp: { increment: bonusXp },
                    total_points: { increment: bonusXp },
                  },
                });
                await tx.activity.create({
                  data: {
                    userId: Number(userId),
                    type: `CHALLENGE_COMPLETED_${challenge.challengeId}`,
                    xpGained: bonusXp,
                  },
                });
              }
            }
          }
          // --- 🏆 GAMIFICATION LOGIC END ---
        }
        return submission;
      });
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
        totalPassed: true, // Useful for the UI
        totalCases: true, // Useful for the UI
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
