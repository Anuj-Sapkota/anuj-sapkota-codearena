import type { Request, Response } from 'express';
import * as Judge0Service from '../services/judge0.service.js';
import { prisma } from '../lib/prisma.js'; // Adjust based on your setup

export const handleSubmission = async (req: Request, res: Response) => {
  const { source_code, language_id, problemId } = req.body;

  if (!source_code || !language_id || !problemId) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing source_code, language_id, or problemId" 
    });
  }

  try {
    // 1. Fetch problem with its test cases
    const problem = await prisma.problem.findUnique({
      where: { problemId: Number(problemId) },
      include: { testCases: true }
    });

    if (!problem || !problem.testCases.length) {
      return res.status(404).json({ success: false, message: "No test cases found for this problem" });
    }

    // 2. Run all test cases in parallel using Promise.all
    const results = await Promise.all(
      problem.testCases.map(async (tc) => {
        // We pass the specific stdin for this test case
        const execution = await Judge0Service.submitCode(source_code, language_id, tc.input);
        
        return {
          stdout: execution.stdout,
          stderr: execution.stderr,
          compile_output: execution.compile_output,
          status: execution.status, // Contains id and description
          isSample: tc.isSample
        };
      })
    );

    // 3. Calculate metrics
    const totalCases = results.length;
    const totalPassed = results.filter(r => r.status.id === 3).length;

    return res.status(200).json({
      success: true, // Request was successful
      results,
      totalPassed,
      totalCases,
      allPassed: totalPassed === totalCases
    });

  } catch (error: any) {
    console.error("Submission Controller Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};