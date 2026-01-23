import axios from "axios";
import type { Judge0Response } from "../types/judge0.types.js";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";
export const submitCode = async (
  sourceCode: string,
  languageId: number,
  stdin: string = "",
  timeLimit: number = 2.0, // Default 2 seconds
  memoryLimit: number = 128.0, // Default 128 MB
): Promise<Judge0Response> => {
  try {
    const response = await axios.post<Judge0Response>(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: timeLimit,
        memory_limit: memoryLimit * 1024, // kilobytes
        stack_limit: 64000, // 64MB stack standard
      },
    );

    return response.data;
  } catch (error) {
    console.error("Judge0 Error:", error);
    throw new Error("Execution engine failed to process the submission.");
  }
};
