import type { Request, Response } from "express";
import * as Judge0Service from "../services/judge0.service.js";
import { prisma } from "../lib/prisma.js";
import { wrapUserCode } from "../utils/code-wrapper.util.js"; // Import your new utility

export const handleSubmission = async (req: Request, res: Response) => {
  const { source_code, language_id, problemId } = req.body;

  if (!source_code || !language_id || !problemId) {
    return res.status(400).json({
      success: false,
      message: "Missing source_code, language_id, or problemId",
    });
  }

  try {
    // 1. Fetch the problem and its test cases
    const problem = await prisma.problem.findUnique({
      where: { problemId: Number(problemId) },
      include: { testCases: true },
    });

    if (!problem || !problem.testCases.length) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No test cases found for this problem",
        });
    }

    // Identify the function name (fallback to 'solution' if not defined in DB)
    const functionName = problem.functionName || "solution";

    // 2. Map and execute all test cases in parallel
    const results = await Promise.all(
      problem.testCases.map(async (tc) => {
        // Use your utility to wrap the user code with the driver script
        const wrappedCode = wrapUserCode(
          source_code,
          language_id,
          tc.input,
          functionName,
        );

        // Send the wrapped code to Judge0
        // Note the empty string "" in the 3rd position for stdin
        const execution = await Judge0Service.submitCode(
          wrappedCode,
          language_id,
          "", // STDIN = FOR FUTURE--------
          problem.timeLimit,
          problem.memoryLimit,
        );
        // Normalize outputs for comparison
        const actual = execution.stdout?.trim() || "";
        const expected = tc.expectedOutput.trim();

        return {
          stdout: actual,
          stderr: execution.stderr,
          compile_output: execution.compile_output,
          status: execution.status,
          // Comparison check: Status must be 'Accepted' (3) AND output must match
          isCorrect: execution.status.id === 3 && actual === expected, // 3==> accepted
          isSample: tc.isSample,
        };
      }),
    );

    // 3. Calculate final metrics
    const totalCases = results.length;
    const totalPassed = results.filter((r) => r.isCorrect).length;

    return res.status(200).json({
      success: true,
      results,
      totalPassed,
      totalCases,
      allPassed: totalPassed === totalCases,
    });
  } catch (error: any) {
    console.error("Submission Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
