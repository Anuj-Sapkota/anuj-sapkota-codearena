import { createAsyncThunk } from "@reduxjs/toolkit";
import { creatorService } from "@/lib/services/creator.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { CreatorApplicationDTO, VerifyOTPDTO, AdminReviewDTO } from "@/types/creator.types";

export const applyCreatorThunk = createAsyncThunk(
  "creator/apply",
  async (data: CreatorApplicationDTO, { rejectWithValue }) => {
    try {
      return await creatorService.apply(data);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const verifyCreatorOTPThunk = createAsyncThunk(
  "creator/verifyOTP",
  async (data: VerifyOTPDTO, { rejectWithValue }) => {
    try {
      return await creatorService.verifyOTP(data);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const reviewApplicationThunk = createAsyncThunk(
  "creator/review",
  async (data: AdminReviewDTO, { rejectWithValue }) => {
    try {
      return await creatorService.reviewApplication(data);
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);