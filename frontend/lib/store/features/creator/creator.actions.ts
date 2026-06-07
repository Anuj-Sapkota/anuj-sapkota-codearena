import { createAsyncThunk } from "@reduxjs/toolkit";
import { creatorService } from "@/lib/services/creator.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import {
  CreatorApplicationDTO,
  VerifyOTPDTO,
  AdminReviewDTO,
} from "@/types/creator.types";

export const applyCreatorThunk = createAsyncThunk(
  "creator/apply",
  async (data: CreatorApplicationDTO, { rejectWithValue }) => {
    try {
      return await creatorService.apply(data);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const verifyCreatorOTPThunk = createAsyncThunk(
  "creator/verifyOTP",
  async (data: VerifyOTPDTO, { rejectWithValue }) => {
    try {
      return await creatorService.verifyOTP(data);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const fetchPendingApplicationsThunk = createAsyncThunk(
  "creator/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      // Calls the service we corrected earlier
      return await creatorService.fetchPendingApplications();
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);

export const reviewApplicationThunk = createAsyncThunk(
  "creator/review",
  async (data: AdminReviewDTO, { rejectWithValue }) => {
    try {
      const response = await creatorService.reviewApplication(data);
      // We return the targetUserId so we can remove them from the list in the slice
      return { userId: data.targetUserId, status: data.status, response };
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  },
);
