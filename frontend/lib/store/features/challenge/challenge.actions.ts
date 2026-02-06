import { createAsyncThunk } from "@reduxjs/toolkit";
import { Challenge, CreateChallengeDTO } from "@/types/challenge.types";
import { handleAxiosError } from "@/utils/axios-error.util";
import { challengeService } from "@/lib/services/challenge.service";

/**
 * Interface for frontend pagination/filtering
 */
export interface FetchChallengesParams {
  page: number;
  limit?: number;
  search?: string;
}

/**
 * Fetch all challenges (Admin Table / Explore Page)
 */
export const fetchChallengesThunk = createAsyncThunk<
  {
    success: boolean;
    data: Challenge[];
    meta: { total: number; page: number; pages: number };
  },
  FetchChallengesParams,
  { rejectValue: string }
>("challenges/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const formattedParams = {
      ...params,
      limit: params.limit || 10,
    };

    return await challengeService.getAll(formattedParams);
  } catch (error: unknown) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to fetch challenges",
    );
  }
});

/**
 * Create a new challenge registry entry
 */
export const createChallengeThunk = createAsyncThunk<
  { success: boolean; data: Challenge; message: string },
  CreateChallengeDTO,
  { rejectValue: string }
>("challenges/create", async (challengeData, { rejectWithValue }) => {
  try {
    console.log("REACHED!!!!!!!!!!");
    return await challengeService.create(challengeData);
  } catch (error: unknown) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to initialize challenge",
    );
  }
});

/**
 * Update challenge by Numeric ID
 */
export const updateChallengeThunk = createAsyncThunk<
  { success: boolean; data: Challenge; message: string },
  { id: number; data: Partial<CreateChallengeDTO> }, // Changed from slug to id
  { rejectValue: string }
>("challenges/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await challengeService.update(id, data);
  } catch (error: unknown) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to update challenge",
    );
  }
});

/**
 * Remove a challenge by Numeric ID
 */
export const deleteChallengeThunk = createAsyncThunk<
  { success: boolean; message: string; id: number }, // Changed slug to id
  number,
  { rejectValue: string }
>("challenges/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await challengeService.delete(id);
    return { ...response, id }; // Return id so slice can filter state
  } catch (error: unknown) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to delete challenge",
    );
  }
});

/**
 * Public: Fetch detailed challenge data by SLUG (browser URL stays pretty)
 */
export const fetchChallengeBySlugThunk = createAsyncThunk<
  { success: boolean; data: Challenge },
  string,
  { rejectValue: string }
>("challenges/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    return await challengeService.getBySlug(slug); // Using getBySlug
  } catch (error: unknown) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to fetch challenge details",
    );
  }
});
