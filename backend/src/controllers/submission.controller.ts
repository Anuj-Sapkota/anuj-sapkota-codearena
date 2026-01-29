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
  const { source_code, language_id, problemId, isFinal } = req.body;
  // Use 'sub' to match your specific middleware requirement
  const userId =
    (req as any).user?.userId || (req as any).user?.id || (req as any).sub;

  try {
    const problem = await prisma.problem.findUnique({
      where: { problemId: Number(problemId) },
      include: { testCases: true },
    });

    if (!problem)
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });

    // Execute Judge0 Logic
    const results = await Promise.all(
      problem.testCases.map(async (tc) => {
        const wrappedCode = wrapUserCode(
          source_code,
          language_id,
          tc.input,
          problem.functionName || "solution",
        );
        const execution = await Judge0Service.submitCode(
          wrappedCode,
          language_id,
          "",
          problem.timeLimit,
          problem.memoryLimit,
        );
        return {
          ...execution,
          isCorrect:
            execution.status.id === 3 &&
            execution.stdout?.trim() === tc.expectedOutput.trim(),
          isSample: tc.isSample,
        };
      }),
    );

    const metrics = calculateMetrics(results);
    const allPassed = results.every((r) => r.isCorrect);
    const totalPassed = results.filter((r) => r.isCorrect).length;

    let newSubmission = null;

    if (isFinal && userId) {
      newSubmission = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
          data: {
            userId: Number(userId),
            problemId: Number(problemId),
            code: source_code,
            languageId: Number(language_id),
            status: allPassed ? "ACCEPTED" : "WRONG_ANSWER",
            totalPassed,
            totalCases: results.length,
            time: metrics.rawTime,
            memory: Math.round(metrics.rawMemory),
          },
        });

        if (allPassed) {
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
      newSubmission, // Crucial for Frontend Redirect
    });
  } catch (error: any) {
    next(error);
  }
};

// submission.controller.ts
export const getSubmissionHistory = async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = (req as any).sub;

  try {
    const history = await prisma.submission.findMany({
      where: {
        userId: Number(userId),
        problemId: Number(problemId),
      },
      orderBy: { createdAt: "desc" }, // Newest first
      select: {
        id: true,
        status: true,
        runtime: true,
        memory: true,
        createdAt: true,
        languageId: true,
        code: true, // Optional: if you want them to be able to click and see old code
      },
    });

    res.status(200).json({ success: true, history });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch history" });
  }
};
