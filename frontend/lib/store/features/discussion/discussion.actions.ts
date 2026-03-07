import { createAsyncThunk } from "@reduxjs/toolkit";
import { discussionService } from "@/lib/services/discussion.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { CreateDiscussionDTO, Discussion } from "@/types/discussion.types";

/**
 * 1. FETCH ALL (Standard User View)
 */
export const fetchDiscussionsThunk = createAsyncThunk<
  { success: boolean; data: Discussion[] },
  {
    problemId: number;
    userId?: number;
    sortBy?: string;
    language?: string;
    search?: string;
  },
  { rejectValue: string }
>("discussions/fetchByProblem", async (params, { rejectWithValue }) => {
  try {
    return await discussionService.getByProblem(
      params.problemId,
      params.userId,
      params.sortBy,
      params.language,
      params.search,
    );
  } catch (error) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to fetch discussions",
    );
  }
});

/**
 * 2. FETCH FLAGGED (Admin Dashboard)
 */
export const fetchFlaggedDiscussionsThunk = createAsyncThunk<
  Discussion[],
  void,
  { rejectValue: string }
>("discussions/fetchFlagged", async (_, { rejectWithValue }) => {
  try {
    const response = await discussionService.getFlagged();
    return response.data; // Using service method
  } catch (error) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to fetch flagged items",
    );
  }
});

/**
 * 3. CREATE
 */
export const createDiscussionThunk = createAsyncThunk<
  { success: boolean; data: Discussion; message: string },
  CreateDiscussionDTO,
  { rejectValue: string }
>("discussions/create", async (discussionData, { rejectWithValue }) => {
  try {
    return await discussionService.create(discussionData);
  } catch (error) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to post discussion",
    );
  }
});

/**
 * 4. UPVOTE
 */
export const toggleUpvoteThunk = createAsyncThunk<
  { success: boolean; data: Discussion },
  string,
  { rejectValue: string }
>("discussions/toggleUpvote", async (id, { rejectWithValue }) => {
  try {
    return await discussionService.toggleUpvote(id);
  } catch (error) {
    return rejectWithValue(
      handleAxiosError(error) || "Failed to process upvote",
    );
  }
});

/**
 * 5. UPDATE
 */
export const updateDiscussionThunk = createAsyncThunk<
  { success: boolean; data: Discussion; message: string },
  { id: string; data: Partial<CreateDiscussionDTO> },
  { rejectValue: string }
>("discussions/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await discussionService.update(id, data);
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to update post");
  }
});

/**
 * 6. DELETE
 */
export const deleteDiscussionThunk = createAsyncThunk<
  { success: boolean; id: string; message: string },
  string,
  { rejectValue: string }
>("discussions/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await discussionService.delete(id);
    return { ...response, id };
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to delete post");
  }
});

/**
 * 7. REPORT (User Action)
 */
export const reportDiscussionThunk = createAsyncThunk<
  { id: string; data: Discussion },
  { id: string; type: string; details: string },
  { rejectValue: string }
>("discussion/report", async ({ id, type, details }, { rejectWithValue }) => {
  try {
    const response = await discussionService.report(id, type, details);
    return { id, data: response.data }; // Using service method
  } catch (error: any) {
    if (error.response?.status === 409) {
      return rejectWithValue("ALREADY_REPORTED");
    }
    return rejectWithValue(
      handleAxiosError(error) || "Failed to submit report",
    );
  }
});

/**
 * 8. MODERATE (Admin Action)
 */
export const moderateDiscussionThunk = createAsyncThunk<
  { id: string; action: "BLOCK" | "UNBLOCK"; data: Discussion },
  { id: string; action: "BLOCK" | "UNBLOCK" },
  { rejectValue: string }
>("discussion/moderate", async ({ id, action }, { rejectWithValue }) => {
  try {
    const response = await discussionService.moderate(id, action);
    return { id, action, data: response.data }; // Using service method
  } catch (error: any) {
    return rejectWithValue(
      handleAxiosError(error) || "Moderation action failed",
    );
  }
});
