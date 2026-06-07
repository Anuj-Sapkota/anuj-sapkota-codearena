import type { NextFunction, Request, Response } from "express";
import * as Judge0Service from "../services/judge0.service.js";
import { wrapUserCode } from "../utils/code-wrapper.util.js";
import {
  getProblemWithTestCasesService,
  processSubmissionService,
  getSubmissionHistoryService,
  getSubmissionStatsService,
} from "../services/submission.service.js";

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

export const handleSubmission = async (req: Request, res: Response, next: NextFunction) => {
  const { source_code, language_id, problemId, isFinal, challengeSlug } = req.body;
  const userId = (req as any).user.sub;

  try {
    const problem = await getProblemWithTestCasesService(Number(problemId));
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    const results = await Promise.all(
      problem.testCases.map(async (tc) => {
        const wrappedCode = wrapUserCode(source_code, language_id, tc.input, problem.functionName || "solution", problem.inputType);
        const execution = await Judge0Service.submitCode(wrappedCode, language_id, tc.input, problem.timeLimit, problem.memoryLimit);

        const statusId = execution?.status?.id;
        const actualOutput = execution.stdout ? Buffer.from(execution.stdout, "base64").toString("utf-8").trim() : "";
        const clean = (str: string) => str.replace(/[\[\]\s]/g, "").replace(/,,+/g, ",");
        const isMatch = clean(actualOutput) === clean(tc.expectedOutput) && clean(actualOutput) !== "";
        const isCorrect = statusId === 3 && isMatch;
        const decodeB64 = (s: string | null | undefined) => { if (!s) return ""; try { return Buffer.from(s, "base64").toString("utf-8").trim(); } catch { return s; } };

        return { ...execution, stderr: decodeB64(execution.stderr), compile_output: decodeB64(execution.compile_output), isCorrect, decodedOutput: actualOutput, isSample: tc.isSample };
      }),
    );

    const metrics = calculateMetrics(results);
    const allPassed = results.every((r) => r.isCorrect);
    const totalPassed = results.filter((r) => r.isCorrect).length;
    const firstFailure = results.find((r) => !r.isCorrect);
    const failMessage = firstFailure?.compile_output || firstFailure?.stderr || firstFailure?.message || null;

    let finalStatus = allPassed ? "ACCEPTED" : "WRONG_ANSWER";
    if (results.find((r) => r.status?.id === 6)) finalStatus = "COMPILATION_ERROR";
    else if (results.find((r) => r.status?.id >= 7 && r.status?.id <= 12)) finalStatus = "RUNTIME_ERROR";

    let newSubmission = null;
    if (isFinal && userId) {
      newSubmission = await processSubmissionService({
        userId: Number(userId), problemId: Number(problemId),
        challengeSlug: String(challengeSlug || ""), source_code,
        language_id: Number(language_id), finalStatus, totalPassed,
        totalCases: results.length, rawTime: metrics.rawTime,
        rawMemory: metrics.rawMemory, failMessage, allPassed,
      });
    }

    return res.status(200).json({ success: true, results, allPassed, totalPassed, totalCases: results.length, metrics: { runtime: metrics.runtime, memory: metrics.memory }, newSubmission });
  } catch (error: any) {
    next(error);
  }
};

export const getSubmissionHistory = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const problemId = Number(req.params.problemId);
    const history = await getSubmissionHistoryService(userId, problemId);
    res.status(200).json({ success: true, history });
  } catch (error: any) {
    console.error("Submission history error:", error.message);
    res.status(500).json({ success: false, message: "Database error fetching history" });
  }
};

export const getSubmissionStats = async (req: Request, res: Response) => {
  try {
    const problemId = Number(req.params.problemId);
    const languageId = req.query.languageId ? Number(req.query.languageId) : undefined;
    const stats = await getSubmissionStatsService(problemId, languageId);
    res.status(200).json({ success: true, stats });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
