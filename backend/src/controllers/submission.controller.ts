import type { Request, Response } from 'express';
import * as Judge0Service from '../services/judge0.service.js';

/**
 * Handles the logic for submitting code to the execution engine
 */
export const handleSubmission = async (req: Request, res: Response) => {
  const { source_code, language_id, stdin } = req.body;

  // 1. Basic Validation
  if (!source_code || !language_id) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing source_code or language_id" 
    });
  }

  try {
    // 2. Call the service
    const result = await Judge0Service.submitCode(source_code, language_id, stdin);

    // 3. Return a clean response
    // Status ID 3 = 'Accepted'
    return res.status(200).json({
      success: result.status.id === 3,
      status: result.status.description,
      output: {
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output
      },
      metrics: {
        time: result.time,
        memory: result.memory
      }
    });

  } catch (error: any) {
    console.error("Submission Controller Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};