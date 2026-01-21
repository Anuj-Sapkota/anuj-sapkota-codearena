import { createAsyncThunk } from "@reduxjs/toolkit";
import { Problem, CreateProblemDTO } from "@/types/problem.types";
import { handleAxiosError } from "@/utils/axios-error.util";
import { problemService } from "@/lib/services/problem.service";

/**
 * Interface for frontend state/input
 */
export interface FetchProblemsParams {
  page: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  categoryIds?: number[];
  status?: string; 
  userId?: number;
  sortBy?: string;
}

/**
 * Interface for the actual API request (Serialized)
 * We Omit categoryIds from the original and re-add it as a string
 */
export interface SerializedFetchProblemsParams extends Omit<FetchProblemsParams, 'categoryIds'> {
  categoryIds?: string;
}

export const fetchProblemsThunk = createAsyncThunk<
  { success: boolean; data: Problem[]; meta: { total: number; page: number; pages: number } },
  FetchProblemsParams,
  { rejectValue: string }
>(
  "problems/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // Create the serialized object without using 'any'
      const formattedParams: SerializedFetchProblemsParams = {
        ...params,
        categoryIds: params.categoryIds?.length ? params.categoryIds.join(",") : undefined,
        limit: params.limit || 8,
      };

      return await problemService.getAll(formattedParams);
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error) || "Failed to fetch problems"
      );
    }
  }
);

export const createProblemThunk = createAsyncThunk<
  { success: boolean; data: Problem; message: string }, 
  CreateProblemDTO,                                    
  { rejectValue: string }                              
>(
  "problems/create",
  async (problemData, { rejectWithValue }) => {
    try {
      return await problemService.create(problemData);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error) || "Failed to create problem");
    }
  }
);

export const updateProblemThunk = createAsyncThunk<
  { success: boolean; data: Problem; message: string },
  { id: number; data: Partial<CreateProblemDTO> },
  { rejectValue: string }
>(
  "problems/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await problemService.update(id, data);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error) || "Failed to update problem");
    }
  }
);

export const deleteProblemThunk = createAsyncThunk<
  { success: boolean; message: string; id: number },
  number,
  { rejectValue: string }
>(
  "problems/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await problemService.delete(id);
      return { ...response, id };
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error) || "Failed to delete problem");
    }
  }
);