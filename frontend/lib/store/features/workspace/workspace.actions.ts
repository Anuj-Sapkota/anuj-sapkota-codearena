import { submissionService } from "@/lib/services/submission.service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { handleAxiosError } from "@/utils/axios-error.util"; // Using your existing utility
import { RunCodeResponse } from "@/types/workspace.types";

export const runCodeThunk = createAsyncThunk<
  RunCodeResponse, // Return type
  { sourceCode: string; langId: number; problemId: string }, // Input params
  { rejectValue: string } // Error type
>(
  "workspace/runCode",
  async ({ sourceCode, langId, problemId }, { rejectWithValue }) => {
    try {
      const response = await submissionService.submitCode(sourceCode, langId, problemId);
      
      // Ensure the response matches the expected structure
      return response; 
    } catch (error: unknown) {
      // Use your existing error utility to keep error messages consistent
      return rejectWithValue(
        handleAxiosError(error) || "Failed to execute code"
      );
    }
  }
);