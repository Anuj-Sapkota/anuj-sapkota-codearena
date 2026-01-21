import { createAsyncThunk } from "@reduxjs/toolkit";
import { Problem, CreateProblemDTO } from "@/types/problem.types";
import { handleAxiosError } from "@/utils/axios-error.util";
import { problemService } from "@/lib/services/problem.service";

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

export interface FetchProblemsParams {
  page: number;
  search?: string;
  difficulty?: string;
  categoryIds?: number[];
  sortBy?: string;
}

export const fetchProblemsThunk = createAsyncThunk<
  { success: boolean; data: Problem[]; meta: { total: number; page: number; pages: number } },
  FetchProblemsParams,
  { rejectValue: string }
>(
  "problems/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // Convert numeric array to string for the API query string
      const formattedParams = {
        ...params,
        categoryIds: params.categoryIds?.length ? params.categoryIds.join(",") : undefined,
        limit: 8, // Ensuring frontend and backend stay in sync on page size
      };

      // Sending formattedParams as query strings
      return await problemService.getAll(formattedParams);
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error) || "Failed to fetch problems"
      );
    }
  }
);

/**
 * Thunk to update a problem
 */
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

/**
 * Thunk to delete a problem
 */
export const deleteProblemThunk = createAsyncThunk<
  { success: boolean; message: string; id: number },
  number,
  { rejectValue: string }
>(
  "problems/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await problemService.delete(id);
      // We return the id back so the slice knows which one to remove from state
      return { ...response, id };
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error) || "Failed to delete problem");
    }
  }
);