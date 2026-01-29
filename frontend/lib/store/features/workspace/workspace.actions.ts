import { submissionService } from "@/lib/services/submission.service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { handleAxiosError } from "@/utils/axios-error.util";
import { RunCodeResponse, SubmissionRecord } from "@/types/workspace.types";

/**
 * Thunk for Running or Submitting Code
 * Passing isFinal: true will trigger the backend to save the result
 */
export const runCodeThunk = createAsyncThunk<
  RunCodeResponse,
  { sourceCode: string; langId: number; problemId: string; isFinal?: boolean },
  { rejectValue: string }
>(
  "workspace/runCode",
  async ({ sourceCode, langId, problemId, isFinal = false }, { rejectWithValue }) => {
    try {
      // Pass the isFinal flag to your service
      const response = await submissionService.submitCode(
        sourceCode, 
        langId, 
        problemId, 
        isFinal
      );
      return response; 
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error) || "Failed to execute code"
      );
    }
  }
);

/**
 * Thunk for Fetching Submission History
 * Retrieves all past attempts for a specific problem
 */
export const fetchSubmissionHistoryThunk = createAsyncThunk<
  SubmissionRecord[], // Return type
  string,             // problemId as input
  { rejectValue: string }
>(
  "workspace/fetchHistory",
  async (problemId, { rejectWithValue }) => {
    try {
      const response = await submissionService.getHistory(problemId);
      return response.history; // Assuming backend returns { success: true, history: [...] }
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error) || "Failed to load submission history"
      );
    }
  }
);