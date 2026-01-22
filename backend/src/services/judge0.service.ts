import axios from 'axios';
import type { Judge0Response } from '../types/judge0.types.js';

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

export const submitCode = async (
  sourceCode: string, 
  languageId: number, 
  stdin: string = ""
): Promise<Judge0Response> => {
  try {
    const response = await axios.post<Judge0Response>(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin
      }
    );

    return response.data;
  } catch (error) {
    console.error("Judge0 Error:", error);
    throw new Error("Execution engine failed to process the submission.");
  }
};