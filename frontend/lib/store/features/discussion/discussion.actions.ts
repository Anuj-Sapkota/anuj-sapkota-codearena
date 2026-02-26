// store/discussion.actions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { discussionService } from "@/lib/services/discussion.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { CreateDiscussionDTO, Discussion } from "@/types/discussion.types";

export const fetchDiscussionsThunk = createAsyncThunk<
  { success: boolean; data: Discussion[] },
  number,
  { rejectValue: string }
>("discussions/fetchByProblem", async (problemId, { rejectWithValue }) => {
  try {
    return await discussionService.getByProblem(problemId);
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to fetch discussions");
  }
});

export const createDiscussionThunk = createAsyncThunk<
  { success: boolean; data: Discussion; message: string },
  CreateDiscussionDTO,
  { rejectValue: string }
>("discussions/create", async (discussionData, { rejectWithValue }) => {
  try {
    return await discussionService.create(discussionData);
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to post discussion");
  }
});

export const toggleUpvoteThunk = createAsyncThunk<
  { success: boolean; data: Discussion }, // Returns updated discussion with new upvote count
  string,
  { rejectValue: string }
>("discussions/toggleUpvote", async (id, { rejectWithValue }) => {
  try {
    return await discussionService.toggleUpvote(id);
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to process upvote");
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
    return { ...response, id }; // Return ID so slice can remove it from state
  } catch (error) {
    return rejectWithValue(handleAxiosError(error) || "Failed to delete post");
  }
});