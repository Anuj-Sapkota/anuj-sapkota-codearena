// store/discussion.actions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { discussionService } from "@/lib/services/discussion.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { CreateDiscussionDTO, Discussion } from "@/types/discussion.types";

export const fetchDiscussionsThunk = createAsyncThunk<
  { success: boolean; data: Discussion[] },
  { problemId: number; userId?: number; sortBy?: string; language?: string }, // Added language
  { rejectValue: string }
>(
  "discussions/fetchByProblem",
  async ({ problemId, userId, sortBy, language }, { rejectWithValue }) => {
    try {
      console.log("Filters from thunk:", { sortBy, language });
      // Passing both sortBy and language to the service
      return await discussionService.getByProblem(problemId, userId, sortBy, language);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error) || "Failed to fetch discussions");
    }
  },
);

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

// NEW: Admin Pin Action (Optional but recommended for Admin part)
export const pinDiscussionThunk = createAsyncThunk<
  { success: boolean; data: Discussion },
  string,
  { rejectValue: string }
>("discussions/pin", async (id, { rejectWithValue }) => {
  try {
    return await discussionService.togglePin(id);
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to pin post");
  }
});